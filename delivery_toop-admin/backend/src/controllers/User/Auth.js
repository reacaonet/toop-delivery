const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");

const ms = require("ms");

const User = require("../../models/UserModel");
const Shopper = require("../../models/ShopperModel");
const CompanyDelivery = require("../../models/Company/CompanyDeliveryModel");
const DeliveryMan = require("../../models/DeliveryMan/DeliveryManModel");
const DriverModel = require("../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../models/LogModel");

/** Service */
const database = require("../../services/firebase");

/** Util */
const { normalizeEmail } = require("../../utils");

const auth = async (req, res) => {
  try {
    let { type, email, password } = req.body;

    if (!type) {
      return messageValidation(res, 400, "Informe um tipo");
    }

    if (!email || !validator.isEmail(email)) {
      return messageValidation(res, 400, "Informe um E-mail válido");
    }

    if (!password || `${password}`.lenght < 6) {
      return messageValidation(res, 400, "Informe uma senha com pelo menos 6 caracteres");
    }

    // Motorista App
    if (type === "driver") {
      return await loginDriver(req, res);
    }

    let user = await User.findOne({
      email,
      deletedAt: {
        $exists: false,
      },
    })
      .populate("person")
      .populate({
        path: "franchises",
        match: {
          status: { $eq: true },
          deletedAt: {
            $exists: false,
          },
        },
      })
      .populate({
        path: "companies",
        match: {
          status: { $eq: true },
          deletedAt: {
            $exists: false,
          },
        },
      })
      .populate({
        path: "company",
        match: {
          status: { $eq: true },
          deletedAt: {
            $exists: false,
          },
        },
      })
      .lean();

    if (!user || !user.person) {
      return messageValidation(res, 401, "Email ou Senha inválido");
    }

    let passwordOK = await bcrypt.compare(`${password}`, `${user.password}`);
    if (passwordOK === false) {
      return messageValidation(res, 401, "Email ou Senha inválido");
    }

    if (type === "shopper") {
      if (user && !user.company) {
        return messageValidation(res, 401, "Nenhuma Empresa ativa vinculada ao usuário informado");
      }

      let shopper = await Shopper.findOne({ person: user.person });
      let companyDelivery = await CompanyDelivery.findOne({
        company: user.company,
      });

      if (!shopper || !CompanyDelivery) {
        return messageValidation(res, 401, "Nenhum usuário encontrado");
      }

      user.shopper = shopper;
      user.companyDelivery = companyDelivery;
    } else if (type === "deliveryMan") {
      let deliveryMan = await DeliveryMan.findOne({ person: user.person });
      if (!deliveryMan) {
        return messageValidation(res, 401, "Nenhum usuário encontrado");
      }

      user.deliveryMan = deliveryMan;
    } else {
      return messageValidation(res, 401, "Usuário não registrado");
    }

    let token = jwt.sign(
      {
        _id: user._id,
        type,
        email: user.email,
        company: user.company,
        isRoot: user.isRoot,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_TTL },
    );

    let refresh = jwt.sign(
      {
        _id: user._id,
        type,
        email: user.email,
        company: user.company,
        isRoot: user.isRoot,
      },
      process.env.JWT_SECRET_REFRESH,
      { expiresIn: process.env.JWT_TTL_REFRESH },
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
    path: 'src/controllers/User/Auth.js',
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
      message: err.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    let validToken = validateToken(refreshToken, res);
    if (validToken !== null) return validToken;

    jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, (err, decode) => {
      if (err) {
        return res.status(401).json({ success: false, message: "not authorized" });
      }

      let token = jwt.sign({ _id: decode._id, type: decode.type }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TTL });

      let refresh = jwt.sign({ _id: decode._id, type: decode.type }, process.env.JWT_SECRET_REFRESH, { expiresIn: process.env.JWT_TTL_REFRESH });

      return res.status(200).send({
        token,
        refresh,
      });
    });
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/User/Auth.js',
    error: err?.message,
    method: 'refreshToken',
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

    console.log(`Error in refresh token => ${err}`);
    return res.status(401).end();
  }
};

const messageValidation = (res, status, message) => {
  return res.status(status).send({
    status: 403,
    message: message,
  });
};

const validateToken = (refreshToken, res) => {
  try {
    if (refreshToken == undefined || refreshToken == null) {
      return res
        .status(401)
        .json({
          success: false,
          message: "token not uninformed",
        })
        .end();
    }

    return null;
  } catch (err) {
   return res.status(401).end();
  }
};

const loginDriver = async (request, reply) => {
  try {
    const { email, password } = request.body;

    const driver = await DriverModel.findOne({
      email: normalizeEmail(email),
      deletedAt: {
        $exists: false,
      },
    }).lean();

    if (!driver || !driver._id) {
      return messageValidation(reply, 401, "Email ou Senha inválido");
    }

    if (`${driver.block}` === "true") {
      return messageValidation(reply, 401, "Seu Cadastro se encontra inativo, para mais detalhes entre em contato com o suporte");
    }

    const passwordOK = await bcrypt.compare(`${password}`, `${driver.password}`.trim());

    // console.log('passwordOK', passwordOK);

    if (passwordOK === false) {
      return messageValidation(reply, 401, "Email ou Senha inválido");
    }

    const token = jwt.sign(
      {
        type: "driver",
        _id: driver._id,
        email: driver.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_TTL },
    );

    const refresh = jwt.sign(
      {
        type: "driver",
        _id: driver._id,
        email: driver.email,
      },
      process.env.JWT_SECRET_REFRESH,
      { expiresIn: process.env.JWT_TTL_REFRESH },
    );

    driver.jwtToken = token;
    delete driver.password;

    return reply.status(200).send({
      token,
      refresh,
      user: driver,
      expiresIn: process.env.JWT_TTL,
      expiresRefreshIn: process.env.JWT_TTL_REFRESH,
    });
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/User/Auth.js',
    error: err?.message,
    method: 'loginDriver',
    type: 'error',
    level: 0,
    origin: 'backend',
    request: {
      application: request?.application,
      franchise: request?.franchise,
      company: request?.company,
      params: request?.params,
      body: request?.body,
      query: request?.query,
      heders: request?.heders,
      method: request?.method,
      url: request?.url,
    },
  });

  console.log(`Log de erro criado com sucesso.`);

    return reply.status(401).send({
      message: "Não foi possível efetuar login",
      err: err.message,
    });
  }
};

module.exports = { auth, refreshToken };
