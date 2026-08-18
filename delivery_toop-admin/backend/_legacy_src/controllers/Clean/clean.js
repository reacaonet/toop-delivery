const mongoose = require("mongoose");
const Person = require("../../models/Person/PersonModel");
const Customer = require("../../models/CustomerModel");
const orderStatus = require("../../models/Shopping/order/orderStatusModel");
const Payment = require("../../models/Shopping/PaymentModel");
const CustomerAddress = require("../../models/Customer/DeliveryAddressModel");
const CouponCustomer = require("../../models/Coupon/CouponCustomerModel");
const ShoppingCart = require("../../models/Shopping/CartModel");
const ShoppingCartItem = require("../../models/Shopping/CartItemModel");
const Chat = require("../../models/chatMessageModel");
const LogModel = require("../../models/LogModel");

const CompanyModel = require("../../models/Company/CompanyModel");

const clean = async (req, res) => {
  try {
    const { person } = req.body;

    if (!person || !mongoose.isValidObjectId(person)) {
      return res.status(400).send({
        message: "Informe um person válido",
      });
    }

    let customer = await Customer.findOne({ person: person }).lean();

    if (!customer || !customer._id) {
      return res.status(400).send({
        message: "Usuário não encontrado",
      });
    }

    let listCart = await ShoppingCart.find({ customer: customer._id }).lean();

    if (listCart && listCart.length > 0) {
      for await (const item of listCart) {
        await ShoppingCartItem.deleteMany({ shoppingCart: item._id });
      }
    }

    await ShoppingCart.deleteMany({ customer: customer._id });
    await CouponCustomer.deleteMany({ customer: customer._id });
    await CustomerAddress.deleteMany({ customer: customer._id });
    await Payment.deleteMany({ customer: customer._id });
    await orderStatus.deleteMany({ customer: customer._id });
    await Customer.deleteMany({ _id: customer._id });
    await Person.deleteMany({ _id: person });

    return res.status(200).send({
      message: "Excluido com sucesso!!",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Clean/clean.js',
      error: err?.message,
      method: 'clean',
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
      message: "Falha ao limpar",
      err: err.message,
    });
  }
};

const cleanAllFranchise = async (req, res) => {
  try {
    const franchise = req.params.franchise;

    if (!franchise || !mongoose.isValidObjectId(franchise)) {
      return res.status(400).send({
        message: "Informe um franchise válido",
      });
    }

    let companies = await CompanyModel.find({ franchise: mongoose.Types.ObjectId(franchise), deletedAt: { $exists: false } });

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i]._id;

      console.log("-----------DELETANDO ShoppingCart ...-----------");
      console.log(await ShoppingCart.find({ company, createdAt: { $lte: "2021-09-24T23:59:59.953Z" } }));
      await ShoppingCart.updateMany(
        { company, createdAt: { $lte: "2021-09-24T23:59:59.953Z" } },
        { status: "deleted", isDeleted: true, deletedAt: new Date() },
      );

      //console.log("-----------DELETANDO listCart ...-----------");
      let listCart = await ShoppingCart.find({ company, createdAt: { $lte: "2021-09-24T23:59:59.953Z" } }).lean();

      console.log("-----------DELETANDO ShoppingCartItem ...-----------");
      console.log(await ShoppingCartItem.find({ shoppingCart: listCart.map(i => i._id), createdAt: { $lte: "2021-09-24T23:59:59.953Z" } }));
      await ShoppingCartItem.updateMany(
        { shoppingCart: listCart.map(i => i._id), createdAt: { $lte: "2021-09-24T23:59:59.953Z" } },
        { isDeleted: true, deletedAt: new Date() },
      );

      console.log("-----------DELETANDO Payment ...-----------");
      console.log(await Payment.find({ company, createdAt: { $lte: "2021-09-24T23:59:59.953Z" } }));
      await Payment.updateMany({ company, createdAt: { $lte: "2021-09-24T23:59:59.953Z" } }, { status: "CANCELED", deletedAt: new Date() });

      console.log("-----------DELETANDO orderStatus ...-----------");
      console.log(await orderStatus.find({ company, createdAt: { $lte: "2021-09-24T23:59:59.953Z" } }));
      await orderStatus.updateMany({ company, createdAt: { $lte: "2021-09-24T23:59:59.953Z" } }, { status: "CANCELED", deletedAt: new Date() });
    }

    return res.status(200).send({
      message: "Excluido com sucesso!!",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Clean/clean.js',
      error: err?.message,
      method: 'cleanAllFranchise',
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
      message: "Falha ao limpar",
      err: err.message,
    });
  }
};

module.exports = { clean, cleanAllFranchise };

//franchise:"60f1a582404fee37686b153d"
//franchise:"60e4fd7976080f47975fc0be"

// persons = OK
// ShoppingCart = OK
// orders = OK
// paymets = OK

//60e4fd7976080f47975fc0be
