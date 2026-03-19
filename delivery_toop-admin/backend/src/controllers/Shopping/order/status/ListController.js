const moment = require("moment");
const mongoose = require("mongoose");
const OrderStatus = require("../../../../models/Shopping/order/orderStatusModel");
const OrderTracking = require("../../../../models/Shopping/order/orderTrackingModel");
const Payment = require("../../../../models/Shopping/PaymentModel");
const LogModel = require("../../../../models/LogModel");
const waitingTime = 30;

const list = async (req, res) => {
  try {
    const { payment } = req.params;

    if (!payment || !mongoose.isValidObjectId(payment)) {
      return res.status(404).send({
        message: "Não encontrado!!",
      });
    }

    const orderStatus = await OrderStatus.findOne({ payment })
      .populate("company")
      .populate({
        path: "customer",
        select: "person",
        populate: {
          path: "person",
          select: "name",
        },
      })
      .populate("customerDelivery")
      .select({})
      .lean();

    let lastTracking = null;

    if (!orderStatus || orderStatus === undefined) {
      return res.status(200).send({});
    }

    if (!orderStatus.note || orderStatus.note === "") {
      try {
        delete orderStatus.note;
      } catch (err) {
        //
      }
    }

    if (orderStatus.typePayment === "MONEY") {
      orderStatus.typePaymentTxt = "Dinheiro";
    } else if (orderStatus.typePayment === "CARD") {
      orderStatus.typePaymentTxt = "Maquininha no Local";
    } else if (orderStatus.typePayment === "PAGARME" || orderStatus.typePayment === "PIX") {
      orderStatus.typePaymentTxt = "Pago Aplicativo";
    } else {
      orderStatus.typePaymentTxt = "";
    }

    lastTracking = await OrderTracking.findOne({ payment }).sort({
      createdAt: 1,
    });

    res.status(200).send({
      orderStatus,
      lastTracking,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/status/ListController.js',
      error: err?.message,
      method: 'list',
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
      message: err.message,
    });
  }
};

const listDelivery = async (req, res) => {
  try {
    const { company } = req.params;
    const { status, createdAt, limit } = req.query;
    const filter = req.query;
    let limitOrder = 50;

    filter.company = mongoose.Types.ObjectId(company);

    filter.status = { $ne: "CANCELED" };

    if (status && status !== undefined) {
      try {
        let statusSplit = status.split("|");
        filter.status = { $in: statusSplit };
      } catch (err) {
        filter.status = status;
      }
    }

    if (createdAt) {
      let date = moment(createdAt);
      date = date.utc(0).format("YYYY-MM-DD 00:00:00 Z");
      filter.createdAt = { $gte: new Date(date) };
    }

    if (limit && limit > 0) {
      limitOrder = parseInt(limit);
    }

    let customerDelivery = {
      from: "customer_delivery_address",
      as: "customerDelivery",
      let: { customerDeliveryId: "$customerDelivery" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$customerDeliveryId"] },
          },
        },
        {
          $project: {
            address: 1,
            location: 1,
            category: 1,
            addressRoute: 1,
            addressRegion: 1,
            city: 1,
            complement: 1,
            district: 1,
            state: 1,
            streetNumber: 1,
          },
        },
        {
          $limit: 1,
        },
      ],
    };

    let companyLookup = {
      from: "company",
      as: "company",
      let: { companyId: "$company" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$companyId"] },
          },
        },
        {
          $project: {
            type: 1,
            name: 1,
            images: 1,
            location: 1,
            address: 1,
            phone: 1,
          },
        },
        {
          $limit: 1,
        },
      ],
    };

    let companyDelivery = {
      from: "company_delivery",
      as: "companyDelivery",
      let: { companyDeliveryId: "$companyDelivery" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$companyDeliveryId"] },
          },
        },
        { $project: { distance: 1, max_distance: 1 } },
        {
          $limit: 1,
        },
      ],
    };

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
            total: 1,
            totalCompany: 1,
            priceDelivery: 1,
            serviceCharge: 1,
            couponPrice: 1,
            cashChange: 1,
          },
        },
        {
          $match: {
            $expr: {
              $in: ["$_id", [{ $arrayElemAt: ["$idArray", -1] }]],
            },
          },
        },
      ],
    };

    let cartItens = {
      from: "shoppingCartItem",
      let: { cartId: "$shoppingCart" },
      as: "cartItem",
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$shoppingCart", "$$cartId"] },
            isDeleted: false,
          },
        },
        { $project: { amount: 1, price: 1, pricePromotion: 1, type: 1 } },
      ],
    };

    let sort = { createdAt: -1 };

    let orderStatus = await OrderStatus.aggregate([
      { $match: filter },
      { $lookup: customerDelivery },
      { $lookup: companyLookup },
      { $lookup: companyDelivery },
      { $lookup: payment },
      { $lookup: cartItens },
      {
        $unwind: {
          path: "$customerDelivery",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
      {
        $unwind: { path: "$companyDelivery", preserveNullAndEmptyArrays: true },
      },
      { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          methodPayment: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$typePayment", "BRASPAG"] },
                  then: "Aplicativo",
                },
                {
                  case: { $eq: ["$typePayment", "PAGARME"] },
                  then: "Aplicativo",
                },
                {
                  case: { $eq: ["$typePayment", "CARD"] },
                  then: "Maquininha do Estabelecimento",
                },
                {
                  case: { $eq: ["$typePayment", "MONEY"] },
                  then: "Pagar em Dinheiro",
                },
                {
                  case: { $eq: ["$typePayment", "PIX_DIRECT"] },
                  then: "Transferência PIX",
                },
                {
                  case: { $eq: ["$typePayment", "PIX"] },
                  then: "PIX",
                },
              ],
              default: "",
            },
          },
          deliveryType: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [{ $eq: ["$typeSchedule", "DELIVERY"] }, { $eq: ["$company.companyCategory", "service"] }],
                  },
                  then: "Visita do Prestador",
                },
                {
                  case: {
                    $and: [{ $eq: ["$typeSchedule", "WITHDRAWAL"] }, { $eq: ["$company.companyCategory", "service"] }],
                  },
                  then: "Marcar no Local",
                },
                {
                  case: { $eq: ["$typeSchedule", "DELIVERY"] },
                  then: "Delivery",
                },
                {
                  case: { $eq: ["$typeSchedule", "WITHDRAWAL"] },
                  then: "Retirar no Estabelecimento",
                },
              ],
              default: "",
            },
          },
        },
      },
      { $sort: sort },
      { $limit: limitOrder },
    ]);

    /*
    const orderStatus = await OrderStatus.find(filter)
      .populate('customerDelivery', {address: 1, location: 1})
      .populate('company', {type: 1, name: 1, images: 1, location: 1, address: 1, phone: 1})
      .populate('companyDelivery', {distance: 1, max_distance: 1})
      .populate('payment', {total: 1})
      .sort({'createdAt': -1});
    */
    res.status(200).send(orderStatus);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/status/ListController.js',
      error: err?.message,
      method: 'listDelivery',
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

    res.status(400).send({
      err: err.message,
    });
  }
};

const listDeliveryMan = async (req, res) => {
  try {
    const { customerDelivery } = req.params;
    const { status, createdAt } = req.query;
    const filter = req.query;
    //filter.customerDelivery = mongoose.Types.ObjectId(customerDelivery);
    filter.deliveryMan = mongoose.Types.ObjectId(customerDelivery);

    filter.status = { $ne: "CANCELED" };
    if (status && status !== undefined) {
      try {
        let statusSplit = status.split("|");
        filter.status = { $in: statusSplit };
      } catch (err) {
        filter.status = status;
      }
    }

    let companyLookup = {
      from: "company",
      as: "company",
      let: { companyId: "$company" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$companyId"] },
          },
        },
        {
          $project: {
            type: 1,
            name: 1,
            images: 1,
            location: 1,
            address: 1,
            phone: 1,
            complement: 1,
          },
        },
        {
          $limit: 1,
        },
      ],
    };

    let getcustomerDelivery = {
      from: "customer_delivery_address",
      as: "customerDelivery",
      let: { customerDeliveryId: "$customerDelivery" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$customerDeliveryId"] },
          },
        },
        { $project: { address: 1, location: 1 } },
        {
          $limit: 1,
        },
      ],
    };

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
            total: 1,
            totalCompany: 1,
            priceDelivery: 1,
            serviceCharge: 1,
            cashChange: 1,
          },
        },
        {
          //$match: { $expr: { $eq: ["$_id", "$$paymentId"] } },
          $match: {
            $expr: { $in: ["$_id", [{ $arrayElemAt: ["$idArray", -1] }]] },
          },
        },
      ],
    };

    let cartItens = {
      from: "shoppingCartItem",
      let: { cartId: "$shoppingCart" },
      as: "cartItem",
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$shoppingCart", "$$cartId"] },
          },
        },
        {
          $project: {
            check: 1,
            radio: 1,
            name: 1,
            amount: 1,
            price: 1,
            type: 1,
          },
        },
      ],
    };

    let sort = { createdAt: -1 };

    let orderStatus = await OrderStatus.aggregate([
      { $match: filter },
      { $lookup: companyLookup },
      { $lookup: getcustomerDelivery },
      { $lookup: payment },
      { $lookup: cartItens },
      {
        $unwind: {
          path: "$customerDelivery",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
      {
        $unwind: { path: "$companyDelivery", preserveNullAndEmptyArrays: true },
      },
      { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
      { $sort: sort },
    ]);

    res.status(200).send(orderStatus);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/status/ListController.js',
      error: err?.message,
      method: 'listDeliveryMan',
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

    res.status(400).send({
      err: err.message,
    });
  }
};

const listDeliveryOne = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        message: "Pedido não encontrado",
      });
    }

    let orderStatus = await OrderStatus.findById(id)
      .populate("customer", { name: 1 })
      .populate("customerDelivery", { address: 1, location: 1 })
      .populate("company", {
        type: 1,
        name: 1,
        images: 1,
        location: 1,
        address: 1,
        phone: 1,
      })
      .populate("companyDelivery", {
        distance: 1,
        max_distance: 1,
      })
      .lean();

    // Informação importante - define o tempo ativo do modal do delivery
    if (orderStatus && orderStatus._id) {
      orderStatus["waitingTime"] = waitingTime;
    }

    if (!orderStatus.typeSchedule) {
      orderStatus["typeSchedule"] = "WITHDRAWAL";
    }

    return res.status(200).send(orderStatus);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/status/ListController.js',
      error: err?.message,
      method: 'listDeliveryOne',
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
      err: err.message,
    });
  }
};

// Retorna uma ordem - utilizado na cron
const listOneCron = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        message: "Pedido não encontrado",
      });
    }

    const response = await OrderStatus.findOne({ _id: id })
      .select({
        status: 1,
        deliveryMan: 1,
      })
      .lean();

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/status/ListController.js',
      error: err?.message,
      method: 'listOneCron',
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
      message: "Fail List one",
      err: err.message,
    });
  }
};

const listOrderCustomer = async (req, res) => {
  try {
    const { customer } = req.params;

    if (!customer || !mongoose.isValidObjectId(customer)) {
      return res.status(404).send({
        message: "Não encontrado!!",
      });
    }

    const orderStatus = await OrderStatus.findOne({
      customer,
      status: "FINISHED",
    });

    let result;
    if (orderStatus) {
      result = true;
    } else {
      result = false;
    }

    res.status(200).send({ result });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/status/ListController.js',
      error: err?.message,
      method: 'listOrderCustomer',
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
      message: err.message,
    });
  }
};

const currentOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { getPayment } = req.query;

    let response = await OrderStatus.findById(id).lean();

    if (getPayment && `${getPayment}` === "true" && response && response.payment) {
      let payment = await Payment.findOne({
        _id: response.payment[response.payment.length - 1],
      })
        .select({
          braspagNotification: 0,
          statusNotification: 0,
          payload: 0,
          updatedAt: 0,
          __v: 0,
        })
        .lean();

      if (payment) {
        response.payment = payment;
      }
    }

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/status/ListController.js',
      error: err?.message,
      method: 'currentOrder',
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
      message: "Falha ao listar",
      err: err.message,
    });
  }
};

module.exports = {
  list,
  listDelivery,
  listDeliveryOne,
  listDeliveryMan,
  listOneCron,
  listOrderCustomer,
  currentOrder,
};
