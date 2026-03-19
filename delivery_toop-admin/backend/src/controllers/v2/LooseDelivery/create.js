const mongoose = require("mongoose");
const axios = require("axios");

const getCustomer = require("./customer");
const CustomerAddressModel = require("../../../models/Customer/DeliveryAddressModel");
const CartModel = require("../../../models/Shopping/CartModel");
const PaymentModel = require("../../../models/Shopping/PaymentModel");
const OrderModel = require("../../../models/Shopping/order/orderStatusModel");
const CompanyModel = require("../../../models/Company/CompanyModel");
const LogModel = require("../../../models/LogModel");

const TypeOfVehicle = require("../../../models/utils/typeOfVehicle");

/**
 * url - /v2/loose-delivery
 * POST
 */
const createLoose = async (req, res) => {
  try {
    const {
      company,
      city,
      address,
      latitude,
      longitude,
      typeAddress,
      total,
      priceDelivery,
      note = "",
      typeVehicle = null,
      referencePoint,
      district,
      streetNumber,
    } = req.body;

    console.log({
      company,
      city,
      address,
      latitude,
      longitude,
      typeAddress,
      total,
      priceDelivery,
      note,
      typeVehicle,
      referencePoint,
      district,
      streetNumber,
    });

    if (!company || !mongoose.isValidObjectId(company)) {
      return messageInvalid(res, "Informe uma empresa válida");
    }

    if (!address) {
      return messageInvalid(res, "Informe o endereço de entrega");
    }

    // if (!typeAddress || (typeAddress !== "HOME" && typeAddress !== "WORK")) {
    //   return messageInvalid(res, "Informe o tipo de endereço");
    // }

    if (!latitude) {
      return messageInvalid(res, "Informe a latitude da entrega");
    }

    if (!longitude) {
      return messageInvalid(res, "Informe a longitude da entrega");
    }

    if (!city) {
      return messageInvalid(res, "Informe a cidade da entrega");
    }

    if (!total || Number(total) === undefined || Number(total) < 0) {
      return messageInvalid(res, "Informe o total da encomenda");
    }

    if (!priceDelivery || Number(priceDelivery) === undefined || Number(priceDelivery) < 0) {
      return messageInvalid(res, "Informe o preço da entrega");
    }

    if (!typeVehicle) {
      return messageInvalid(res, "Informe o tipo de veículo");
    }
    const customer = await getCustomer();

    if (!customer) {
      return messageInvalid(res, "Nao foi possível obter dados do cliente");
    }

    const isCompany = await CompanyModel.findById(company)
      .select({
        _id: 1,
        companyDelivery: 1,
        franchise: 1,
      })
      .lean();

    if (!isCompany || !isCompany._id) {
      return res.status(400).send({
        message: "Para criar entrega avulsa é necessário ter cadastro como empresa",
      });
    }

    const respAddress = await CustomerAddressModel.create({
      address,
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
      customer: customer._id,
      // category: typeAddress,
      city,
      referencePoint,
      district,
      streetNumber,
    });

    if (!respAddress || !respAddress._id) {
      return messageInvalid(res, "Nao foi possível registrar o endereço");
    }

    const respCart = await CartModel.create({
      customer: customer._id,
      company: company,
      status: "purchaded",
    });

    if (!respCart || !respCart._id) {
      await CustomerAddressModel.deleteOne({ _id: respAddress._id });
      return messageInvalid(res, "Nao foi possível registrar um carrinho para entrega");
    }

    const respPay = await createPayment(customer, respCart, respAddress, company, total, priceDelivery);

    if (!respPay || !respPay._id) {
      await CustomerAddressModel.deleteOne({ _id: respAddress._id });
      await CartModel.deleteOne({ _id: respCart._id });
      return messageInvalid(res, "Nao foi possível registrar o faturamento desta solicitação");
    }

    const respOrder = await createOrder("WAIT_COMPANY", respPay._id, company, isCompany.companyDelivery, isCompany.franchise, respCart._id, customer._id, respAddress._id, note, typeVehicle);

    if (!respOrder || !respOrder._id) {
      await CustomerAddressModel.deleteOne({ _id: respAddress._id });
      await CartModel.deleteOne({ _id: respCart._id });
      await PaymentModel.deleteOne({ _id: respPay._id });
      return messageInvalid(res, "Nao foi possível registrar uma ordem da solicitação");
    }

    // Atualizar a Ordem no Pagamento
    await PaymentModel.updateOne(
      { _id: respPay._id },
      {
        order: respOrder._id,
      },
    );

    // Despachar procurando entregador
    const call = await callDelivery(respOrder._id);

    return res.status(200).send(respOrder);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/LooseDelivery/create.js',
      error: err?.message,
      method: 'createLoose',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    console.log(err);
    return res.status(400).send({
      message: "Não foi possível criar entrega avulsa",
      err: err.message,
    });
  }
};

const messageInvalid = (res, message) => {
  return res.status(400).send({
    message,
  });
};

const createPayment = async (customer, respCart, respAddress, company, total, priceDelivery) => {
  try {
    const respPay = await PaymentModel.create({
      customer: customer._id,
      shoppingCart: respCart._id,
      company: company,
      total: Number(total) + Number(priceDelivery),
      priceDelivery: priceDelivery,
      totalCompany: total,
      serviceCharge: 0,
      deliveryAddress: respAddress._id,
      capture: false,
      typePayment: "MONEY",
      status: "AWAITING_PAYMENT",
      singleDelivery: true,
    });

    return respPay;
  } catch (err) {
    console.log("Fail register payment", err.message);
    return false;
  }
};

const createOrder = async (status, paymentId, company, companyDelivery, franchise, shoppingCart, customer, customerDelivery, note, typeVehicle) => {
  try {
    const payload = {
      status,
      order_number: Math.floor(1000 + Math.random() * 9000),
      payment: [paymentId],
      company,
      companyDelivery,
      franchise,
      shoppingCart,
      customer,
      customerDelivery,
      typePayment: "MONEY",
      typeSchedule: "DELIVERY",
      note,
      singleDelivery: true,
    };

    if (company?.companyDelivery) {
      payload.companyDelivery = company?.companyDelivery;
    }

    if (typeVehicle && TypeOfVehicle.includes(`${typeVehicle}`.trim())) {
      payload.typeOfVehicle = typeVehicle;
    }

    const respOrder = await OrderModel.create(payload);

    return respOrder;
  } catch (err) {
    console.log("Fail register order", err.message);
    return false;
  }
};

const callDelivery = async orderId => {
  try {
    const { data: response } = await axios.put(`${process.env.HOST}:${process.env.PORT}/order/status/${orderId}`, {
      status: "WAIT_DELIVERYMAN",
    });

    return response;
  } catch (err) {
    console.log("fail callDelivery", err);
    return;
  }
};

module.exports = createLoose;
