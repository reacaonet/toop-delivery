const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");

const ms = require("ms");

const User = require("../../models/UserModel");
const Shopper = require("../../models/ShopperModel");
const DeliveryMan = require("../../models/DeliveryMan/DeliveryManModel");
const LogModel = require("../../models/LogModel");

const authAdmin = async (req, res) => {
  try {
    let { type, email, password } = req.body;

    if (!email || !validator.isEmail(email)) {
      return messageValidation(res, 200, "Informe um E-mail válido", 401);
    }

    if (!password || `${password}`.lenght < 6) {
      return messageValidation(res, 200, "Informe uma senha com pelo menos 6 caracteres", 401);
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
        select: "name",
      })
      .populate({
        path: "companies",
        match: {
          status: { $eq: true },
          deletedAt: {
            $exists: false,
          },
        },
        select: "name",
      })
      .lean();

    if (!user || !user.person) {
      return messageValidation(res, 200, "Email ou Senha inválido", 401);
    }

    // Entregador
    const isDeliveryman = await DeliveryMan.findOne({
      person: user.person._id,
    })
      .select({
        _id: 1,
      })
      .lean();

    if (isDeliveryman && isDeliveryman._id) {
      return messageValidation(res, 200, "Não é possível autenticar com conta do tipo entregador", 401);
    }

    let passwordOK = await bcrypt.compare(password, user.password);
    if (passwordOK === false) {
      return messageValidation(res, 200, "Email ou Senha inválido", 401);
    }

    if (user.isRoot === false && user.companies.length === 0 && user.franchises.length === 0) {
      return messageValidation(res, 200, "Email ou Senha inválido", 401);
    }

    let accessToken = jwt.sign(
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

    let refreshToken = jwt.sign(
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

    // update token and refreshtoken
    const userUp = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          accessToken,
          refreshToken,
        },
      },
      {
        new: true,
      },
    );

    if (userUp && userUp._id) {
      user.accessToken = userUp.accessToken;
      user.refreshToken = userUp.refreshToken;
    }

    const rolesList = email === "admin@economizebr.com" ? [1] : [];

    let shopper = null;
    if (email !== "admin@economizebr.com" && user.person && user.person._id) {
      shopper = await Shopper.findOne({
        person: user.person._id,
      })
        .select({ _id: 1 })
        .lean();

      if (shopper && shopper._id) {
        user.shopper = shopper._id;
      }
    }

    return res.status(200).send({
      accessToken,
      refreshToken,
      roles: rolesList,
      expiresIn: ms(process.env.JWT_TTL),
      expiresRefreshIn: ms(process.env.JWT_TTL_REFRESH),
      user: user,
      pic: "./assets/media/users/300_25.jpg",
      fullname: "Sean",
      occupation: "CEO",
      companyName: "Keenthemes",
      phone: "456669067890",
      address: {
        addressLine: "L-12-20 Vertex, Cybersquare",
        city: "San Francisco",
        state: "California",
        postCode: "45000",
      },
      socialNetworks: {
        linkedIn: "https://linkedin.com/admin",
        facebook: "https://facebook.com/admin",
        twitter: "https://twitter.com/admin",
        instagram: "https://instagram.com/admin",
      },
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/User/AuthAdmin.js',
      error: err?.message,
      method: 'authAdmin',
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
        return res.status(401).json({
          success: false,
          message: "not authorized",
        });
      }

      let token = jwt.sign(
        {
          _id: decode._id,
          type: decode.type,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_TTL,
        },
      );

      let refresh = jwt.sign(
        {
          _id: decode._id,
          type: decode.type,
        },
        process.env.JWT_SECRET_REFRESH,
        {
          expiresIn: process.env.JWT_TTL_REFRESH,
        },
      );

      return res.status(200).send({
        token,
        refresh,
      });
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/User/AuthAdmin.js',
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

    return res.status(401).end();
  }
};

const messageValidation = (res, status, message, code) => {
  return res.status(status).send({
    message: message,
    code,
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

module.exports = {
  authAdmin,
  refreshToken,
};

// {
//   "id": 1,
//   "username": "admin",
//   "email": "admin@demo.com",
//   "accessToken": "access-token-8f3ae836da744329a6f93bf20594b5cc",
//   "refreshToken": "access-token-f8c137a2c98743f48b643e71161d90aa",
//   "roles": [
//     1
//   ],
//   "pic": "./assets/media/users/300_25.jpg",
//   "fullname": "Sean",
//   "occupation": "CEO",
//   "companyName": "Keenthemes",
//   "phone": "456669067890",
//   "address": {
//     "addressLine": "L-12-20 Vertex, Cybersquare",
//     "city": "San Francisco",
//     "state": "California",
//     "postCode": "45000"
//   },
//   "socialNetworks": {
//     "linkedIn": "https://linkedin.com/admin",
//     "facebook": "https://facebook.com/admin",
//     "twitter": "https://twitter.com/admin",
//     "instagram": "https://instagram.com/admin"
//   }
// }
