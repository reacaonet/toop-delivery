const mongoose = require("mongoose");
const mailer = require("../../config/nodemailer");
const moment = require("moment");

const Customer = require("../../models/CustomerModel");
const getRandom = require("./utils/getRandom");

const User = require("../../models/UserModel");
const Shopper = require("../../models/ShopperModel");
const LogModel = require('../../models/LogModel');

const notificationApi = require("../../services/notification");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data.sku = await uniqueSku();

    let customer = await newCustomer(data);

    return res.send({
      status: 200,
      message: "Customer criada com sucesso",
      data: customer,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Customer/CreateController.js',
    error: dadosDoErro?.message,
    method: 'CreateController',
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


    console.log("Fail create customer", dadosDoErro);
    return res.status(400).send({
      message: "Falha ao criar Customer",
      Error: dadosDoErro,
    });
  }
};

const newCustomer = async data => {
  let subject;
  let customer = await Customer.create(data);
  let nameUser;

  if (customer && customer._id) {
    customer = await Customer.findById(customer._id).populate("person");
  }

  if (process.env.MAILER_ENVIRONMENT) {
    subject = `${process.env.MAILER_ENVIRONMENT} - Novo usuário cadastrado`;
  } else {
    subject = "Novo usuário cadastrado";
  }

  warnDefinedList();

  if (customer.person.name) {
    nameUser = customer.person.name;
  } else if (customer.person.email) {
    nameUser = customer.person.email;
  } else {
    nameUser = customer.phone;
  }

  return customer;
};

const uniqueSku = async () => {
  try {
    let sku = getRandom(18);
    let response = await Customer.findOne({ sku }).lean();

    if (!response || !response.sku) {
      return sku;
    }

    return await isUnique();
  } catch (err) {
    return "";
  }
};

// Gambiarra pedida pelo maurício
const warnDefinedList = async () => {
  try {
    let listEmails = ["samuelfrc@hotmail.com", "plantao1@ebr.com", "plantao2@ebr.com", "plantao3@ebr.com", "plantao4@ebr.com"];

    let list = await User.find({ email: { $in: listEmails } })
      .select({ person: 1 })
      .limit(5)
      .lean();

    let listPerson = list.map(item => {
      return mongoose.Types.ObjectId(item.person);
    });

    // Tokens para envio
    const listShopper = await Shopper.find({ person: { $in: listPerson } })
      .select({ token: 1 })
      .lean();

    if (!listShopper) {
      return;
    }

    for await (const item of listShopper) {
      try {
        await notificationApi.post(`/v1/app-notification/user/${listShopper.person}`, {
          user: {
            auth: item.token,
            message: `Novo usuario cadastrado`,
          },
        });
      } catch (err) {
        console.log("warnDefinedList", err);
      }
    }
  } catch (err) {
    console.log("Oops warnDefinedList", err);
  }
};
