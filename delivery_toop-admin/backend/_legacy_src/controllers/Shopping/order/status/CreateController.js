const mailer = require("../../../../config/nodemailer");
const moment = require("moment");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const Twilio = require("../../../../models/twilio");

const mongoose = require("mongoose");
const OrderStatus = require("../../../../models/Shopping/order/orderStatusModel");
const LogModel = require("../../../../models/LogModel");
const Company = require("../../../../models/Company/CompanyModel");

const create = async (req, res) => {
  try {
    const dataPost = req.body;
    const orderStatus = await newOrder(dataPost);
    data._id = new mongoose.Types.ObjectId().toHexString();

    if (orderStatus === false) {
      return res.status(400).send({
        message: "Não foi possível salvar Ordem do pedido",
      });
    }

    return res.status(200).send(orderStatus);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/status/CreateController.js',
      error: err?.message,
      method: 'create',
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

const newOrder = async dataPost => {
  try {
    const orderStatus = await OrderStatus.create(dataPost);

    if (orderStatus && orderStatus._id) {
      sendNotification(orderStatus);
    }
    return orderStatus;
  } catch (err) {
    Log.create({
      typeSystem: "BACKEND",
      typeLog: "ERROR",
      description: {
        message: err.message,
        err: err,
      },
      category: "order-create-error",
      originError: "newOrder",
    });

    return false;
  }
};

const sendNotification = async orderStatus => {
  try {
    let subject;
    const filter = {};

    if (process.env.MAILER_ENVIRONMENT) {
      subject = `(${process.env.MAILER_ENVIRONMENT}) Novo pedido - #${orderStatus.order_number}`;
    } else {
      subject = `Novo pedido - #${orderStatus.order_number}`;
    }

    filter.active = { $eq: true };
    const callUsers = await Twilio.find(filter);

    if (callUsers) {
      for (const callUser of callUsers) {
        await client.calls.create({
          url: "https://handler.twilio.com/twiml/EHf9c8793321b9cf4ebdb1b462ba561589",
          to: callUser.phone,
          from: "+13028658482",
        });
      }
    }

    let titleEmail;

    if (orderStatus.company) {
      const { type } = await Company.findById(orderStatus.company);

      titleEmail = `Novo pedido em ${type} feito no Gojá`;
    } else {
      titleEmail = `Novo pedido feito no Gojá`;
    }

    // mailer.sendMail(
    //   {
    //     to:
    //       "mauriciomartinscruz@gmail.com, contato@economizebr.com, daniel25mb@gmail.com, samuelfrc@hotmail.com",
    //     from: process.env.MAILER_USER,
    //     subject,
    //     html: `
    //       <h1 style="font-family:Arial, Helvetica;">${titleEmail}</h1>
    //       <p style="font-family:Arial, Helvetica;">Pedido feito ${moment().locale('pt-br').startOf(orderStatus.createdAt).fromNow()}.</p>
    //     `,
    //   },
    //   (err) => {
    //     if (err) {
    //       console.log(err);
    //     }
    //   }
    // );
  } catch (err) {
    return;
  }
};

module.exports = { create, newOrder };
