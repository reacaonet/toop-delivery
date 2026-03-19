const mongoose = require("mongoose");
const axios = require("axios");
const OrderStatus = require("../../../models/Shopping/order/orderStatusModel");
const Payment = require("../../../models/Shopping/PaymentModel");
const LogModel = require("../../../models/LogModel");
const distanceKM = require("../../../utils/distanceCoordinate");

const listFreight = async (req, res) => {
  try {
    const { order } = req.params;

    if (!order || !mongoose.isValidObjectId(order)) {
      return res.status(400).send({
        message: "inform order valid",
      });
    }

    // Apenas quando for pago via App
    // Em dinheiro não pode ser ativado

    const orderStatus = await getOrderStatus(order);

    if (!orderStatus || !orderStatus._id) {
      return res.status(400).send({
        message: "Inform order valid",
      });
    }

    const response = await getFreight(orderStatus);

    // Cobrar valor do frete ao utilzar - chamar entregador
    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/CostFreightController.js',
      error: err?.message,
      method: 'listFreight',
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

    return res.status(400).send({
      message: "Fail list Freight",
      err: err.message,
    });
  }
};

const getOrderStatus = async order => {
  let payment = {
    from: "payment",
    let: { paymentId: "$payment" },
    as: "payment",
    pipeline: [
      {
        $project: {
          idArray: {
            $cond: {
              // ultimo id Payment como principal
              if: { $isArray: ["$$paymentId"] },
              then: "$$paymentId",
              else: ["$$paymentId"],
            },
          },
          priceDelivery: 1,
        },
      },
      {
        $match: {
          $expr: { $in: ["$_id", [{ $arrayElemAt: ["$idArray", -1] }]] },
        },
      },
      { $limit: 1 },
    ],
  };

  let customerDelivery = {
    from: "customer_delivery_address",
    let: { id: "$customerDelivery" },
    as: "customerDelivery",
    pipeline: [
      {
        $match: {
          $expr: { $eq: ["$_id", "$$id"] },
        },
      },
      { $project: { location: 1 } },
    ],
  };

  let company = {
    from: "company",
    let: { id: "$company" },
    as: "company",
    pipeline: [
      {
        $match: { $expr: { $eq: ["$_id", "$$id"] } },
      },
      { $project: { location: 1 } },
    ],
  };

  let companyDelivery = {
    from: "company_delivery",
    let: { id: "$companyDelivery" },
    as: "companyDelivery",
    pipeline: [
      {
        $match: { $expr: { $eq: ["$_id", "$$id"] } },
      },
      { $project: { own_delivery: 1 } },
    ],
  };

  let orderResponse = await OrderStatus.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(order),
      },
    },
    { $lookup: payment },
    { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
    { $lookup: company },
    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
    { $lookup: companyDelivery },
    { $unwind: { path: "$companyDelivery", preserveNullAndEmptyArrays: true } },
    { $lookup: customerDelivery },
    {
      $unwind: { path: "$customerDelivery", preserveNullAndEmptyArrays: true },
    },
    { $limit: 1 },
  ]);

  if (orderResponse && orderResponse.length > 0) {
    return orderResponse[0];
  }

  return {};
};

const getFreight = async orderStatus => {
  let ownDelivery = false;
  if (orderStatus.companyDelivery && orderStatus.companyDelivery.own_delivery) {
    ownDelivery = orderStatus.companyDelivery.own_delivery;
  }

  let costFreight = orderStatus.payment.priceDelivery;
  let typePayment = orderStatus.typePayment;
  let isDispatch = ownDelivery === true ? true : false;

  // Não é necessário cobrar valor do frete ao chamar entregador
  if ((typePayment === "BRASPAG" || typePayment === "PAGARME") && (!ownDelivery || costFreight > 0)) {
    return {
      freight: false, // sem frete adicional
      dispatch: isDispatch, // opção despachar pode ser utilizada
      typePayment,
    };
  }

  // O Usuário já pagou o frete na compra
  if (typePayment !== "BRASPAG" && typePayment !== "PAGARME" && ownDelivery && costFreight > 0) {
    return {
      freight: false, // sem frete adicional
      dispatch: isDispatch, // opção despachar pode ser utilizada
      typePayment,
    };
  }

  let distance = distanceKM(
    {
      latitude: orderStatus.company.location.coordinates[1],
      longitude: orderStatus.company.location.coordinates[0],
    },
    {
      latitude: orderStatus.customerDelivery.location.coordinates[1],
      longitude: orderStatus.customerDelivery.location.coordinates[0],
    },
  );

  let freightPrice = await freightTable(distance);

  return {
    freight: true, // cobrar valor do frete
    deliveryPrice: freightPrice.deliveryPrice,
    dispatch: isDispatch,
  };
};

const freightTable = async distance => {
  try {
    let freight = {
      deliveryPrice: 15,
    };

    let table = [
      {
        min: 0,
        max: 2000,
        price: 4.25,
      },
      {
        min: 2000,
        max: 4000,
        price: 6,
      },
      {
        min: 4000,
        max: 10000,
        price: 8,
      },
      {
        min: 10000,
        max: 20000,
        price: 15,
      },
    ];

    table.forEach(element => {
      const min = element.min / 1000;
      const max = element.max / 1000;

      if (distance >= min && distance <= max) {
        freight.deliveryPrice = element.price;
        return freight;
      }
    });

    return freight;
  } catch (err) {
    return false;
  }
};

const updateFreight = async (req, res) => {
  try {
    const { order } = req.params;
    const { status, shopper } = req.body;

    if (!order || !mongoose.isValidObjectId(order)) {
      return res.status(400).send({
        message: "inform order valid",
      });
    }

    if (!status || !shopper) {
      return res.status(400).send({
        message: "no information found to change ",
      });
    }

    const orderStatus = await getOrderStatus(order);

    if (!orderStatus || !orderStatus._id) {
      return res.status(400).send({
        message: "Inform order valid",
      });
    }

    const response = await getFreight(orderStatus);

    if (!response || response.freight !== true) {
      return res.status(400).send({
        message: "it is not allowed to use this feature",
      });
    }

    // Atualizar Payment com o frete a ser cobrado do estabelecimento
    let payment = await Payment.findOneAndUpdate(
      {
        _id: orderStatus.payment._id,
      },
      {
        priceFreight: response.deliveryPrice,
      },
      { new: true },
    );

    if (!payment || payment.priceFreight !== response.deliveryPrice) {
      return res.status(400).send({
        message: "Failed to update status",
      });
    }

    // acionar o update Status
    const { data: responseOrder } = await axios.put(`${process.env.HOST}:${process.env.PORT}/order/status/${order}`, {
      status,
      shopper,
    });

    return res.status(200).send({
      status: true,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/CostFreightController.js',
      error: err?.message,
      method: 'updateFreight',
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

    return res.status(400).send({
      message: "Fail update Freight",
      err: err.message,
    });
  }
};

module.exports = { listFreight, updateFreight };
