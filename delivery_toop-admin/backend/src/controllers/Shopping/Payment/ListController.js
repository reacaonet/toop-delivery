const mongoose = require("mongoose");
const Payment = require("../../../models/Shopping/PaymentModel");
const OrderStatus = require("../../../models/Shopping/order/orderStatusModel");
const LogModel = require("../../../models/LogModel");

const listOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { fields, order } = req.query;
    let payment = {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Id inválido",
      });
    }

    if (fields) {
      payment = await Payment
        .findById(id)
        .select(fields.split(','))
        .lean();
    } else {
      payment = await Payment.findById(id)
        .populate("customer")
        .populate("shoppingCart")
        .populate("deliveryAddress")
        .lean();

      if (payment && payment._id && order) {
        const orderResponse = await OrderStatus.findOne({
          payment: payment._id
        })
          .select({
            typePayment: 1,
            status: 1,
            order_number: 1,
          })
          .lean();

        payment.order = orderResponse;
      }
    }

    return res.send(payment);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Payment/ListController.js',
      error: err?.message,
      method: 'listOne',
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
      message: "Falha ao listar",
      Error: err,
    });
  }
};

const listPayCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    let filter = {};

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).send({
        message: "Id inválido",
      });
    }

    if (customerId) {
      filter.customer = mongoose.Types.ObjectId(customerId);
    }

    /*
    const listPayment = await Payment.find(filter)
      .populate('company')
      .populate('deliveryAddress', {address: 1})
    */

    let company = {
      from: "company",
      localField: "company",
      foreignField: "_id",
      as: "company",
    };

    let orderStatus = {
      from: "orderStatus",
      localField: "_id",
      foreignField: "payment",
      as: "orderStatus",
    };

    let avaliation = {
      from: "avaliation",
      localField: "_id",
      foreignField: "payment",
      as: "avaliation",
    };

    const listPayment = await Payment.aggregate([
      { $match: filter },
      { $lookup: company },
      { $lookup: orderStatus },
      { $lookup: avaliation },
      { $unwind: "$company" },
      { $unwind: "$orderStatus" },
    ]).sort({ createdAt: -1 });

    return res.status(200).send(listPayment);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Payment/ListController.js',
      error: err?.message,
      method: 'listPayCustomer',
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
      Error: err.message,
    });
  }
};

const listPayCustomerActive = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { cartSuccess } = req.query;
    const showCartSuccess = cartSuccess ? true : false;
    let filter = {};

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).send({
        message: "Id inválido",
      });
    }

    if (customerId) {
      filter.customer = mongoose.Types.ObjectId(customerId);
    }

    if (showCartSuccess) {
      filter.status = { $in: ["FINISHED"] };
    } else {
      filter.status = { $nin: ["FINISHED", "CANCELED"] };
    }

    let company = {
      from: "company",
      localField: "company",
      foreignField: "_id",
      as: "company",
    };

    let payment = {
      from: "payment",
      localField: "payment",
      foreignField: "_id",
      as: "payment",
    };

    const listPayment = await OrderStatus.aggregate([
      { $match: filter },
      { $lookup: company },
      { $lookup: payment },
      { $unwind: "$company" },
      { $unwind: "$payment" },
    ]);

    return res.status(200).send(listPayment);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Payment/ListController.js',
      error: err?.message,
      method: 'listPayCustomerActive',
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
      Error: err.message,
    });
  }
};

module.exports = { listOne, listPayCustomer, listPayCustomerActive };
