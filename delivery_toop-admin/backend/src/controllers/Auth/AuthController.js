const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ms = require("ms");

const UserModel = require("../../models/UserModel");
const LogModel = require("../../models/LogModel");


const auth = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (validateLogin(req) === false)
      return res.status(401).send({ message: "Informe os dados de acesso!!" });

    let user = await UserModel.findOne({ email }).lean();
    if (!user) return authErrorMessage(res);

    let passwordOK = await bcrypt.compare(password, user.password);
    if (passwordOK === false) return authErrorMessage(res);

    let token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_TTL }
    );

    let refresh = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET_REFRESH,
      { expiresIn: process.env.JWT_TTL_REFRESH }
    );

    delete user.password;

    return res.status(200).send({
      token,
      expiresIn: ms(process.env.JWT_TTL),
      refresh,
      expiresRefreshIn: ms(process.env.JWT_TTL_REFRESH),
      user: user,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Auth/AuthController.js',
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

    return res.status(501).end();
  }
};

const validateLogin = async (req) => {
  try {
    let body = req.body;

    if (!body.hasOwnProperty("email")) return false;

    if (!body.hasOwnProperty("password")) return false;

    if (body.email == null || body.password == null) return false;

    return true;
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Auth/AuthController.js',
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
};

const authErrorMessage = (res) => {
  return res.status(401).send({
    message: "Email ou Senha inválido",
  });
};

module.exports = auth;
