const bcrypt = require('bcrypt');
const Shooper = require('../../models/Person/ShopperModel');
const LogModel = require("../../models/LogModel");

const auth = async (req, res) => {
  try {

    if (validateLogin(req) === false) {
      return res.status(401).send({
        message: 'Informe os dados de acesso!!'
      });
    }

    let shooper = await Shooper.findOne({
      email: req.body.email
    }).lean();

    if (!shooper) {
      return res.status(401).send({
        message: 'E-mail ou Senha inválido'
      });
    }

    let passwordOK = await bcrypt.compare(req.body.password, shooper.password)

    if (passwordOK === false) {
      return res.status(401).send({
        message: 'Login ou Senha inválido'
      });
    }

    delete shooper.password;
    return res.status(200).send(shooper);

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Person/_AuthShooper.js',
      error: err?.message,
      method: 'auth',
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

const validateLogin = async (req) => {
  try {
    let body = req.body;

    if (!body.hasOwnProperty('email'))
      return false;

    if (!body.hasOwnProperty('password'))
      return false;

    if (body.email == null || body.password == null)
      return false;

    return true;
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Person/_AuthShooper.js',
      error: err?.message,
      method: 'validateLogin',
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

    return false;
  }
}

module.exports = { auth };
