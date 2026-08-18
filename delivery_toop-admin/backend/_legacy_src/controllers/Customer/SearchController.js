const axios = require("axios");
const jwt = require("jsonwebtoken");
// const adminFirebase = require('../../services/firebaseAdmin');

const Customer = require("../../models/CustomerModel");
const PersonModel = require("../../models/Person/PersonModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { ddi = null, phone, email, person, limit, loginType } = req.query;
    if (loginType === "GOOGLE_EMAIL") {
      let resp = await loginNoPassword(req, res);

      if (resp) {
        return resp;
      }
    }

    let or = [];

    if (phone) {
      or.push({
        phone: new RegExp(phone, ""),
      });
    }

    if (email) {
      or.push({
        email: email,
      });
    }

    if (person) {
      or.push({
        person: person,
      });
    }

    if (!or.length) {
      return res.status(400).send({
        message: "Filtro é obrigatório",
      });
    }

    const customer = await Customer.findOne({ $or: or }).populate("person").lean();

    if (customer && customer._id && !customer.ddi && ddi) {
      await Customer.updateOne({ _id: customer._id }, { ddi: `${ddi}` });
      if (customer.person && customer.person._id) {
        await PersonModel.updateOne(
          { _id: customer.person._id },
          {
            ddi: `${ddi}`,
          },
        );
      }
    }

    if (loginType === "GOOGLE_EMAIL") {
      const token = jwt.sign(
        {
          _id: customer._id ? customer._id : null,
          email: customer.email ? customer.email : null,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_TTL,
        },
      );

      const refresh = jwt.sign(
        {
          _id: customer._id ? customer._id : null,
          email: customer.email ? customer.email : null,
        },
        process.env.JWT_SECRET_REFRESH,
        {
          expiresIn: process.env.JWT_TTL_REFRESH,
        },
      );

      customer.token = token;
      customer.refresh = refresh;
    }

    return res.status(200).send(customer);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Customer/SearchController.js',
      error: err?.message,
      method: 'SearchController',
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
      message: "Falha ao encontrar Customer",
      Error: err.message,
    });
  }
};

const loginNoPassword = async (req, res) => {
  try {
    const { email, idToken } = req.query;

    if (!email || !idToken) {
      return res.status(401).send({
        message: "not authorized token is mandatory",
      });
    }

    const resp = await verifyIdToken(`${idToken}`);

    if (!resp) {
      return res.status(401).send({
        message: "not authorized",
      });
    }

    return null;
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Customer/SearchController.js',
      error: err?.message,
      method: 'loginNoPassword',
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

    return res.status(401).send({
      message: "not authorized",
      err: err.message,
    });
  }
};

const verifyIdToken = async token => {
  try {
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const data = response.data;

    if (data.typ && data.typ === "JWT" && data.kid && data.aud) {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
};
