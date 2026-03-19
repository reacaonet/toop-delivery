const LogModel = require("../../models/LogModel");

const jwt = require('jsonwebtoken');

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    let validToken = validateToken(refreshToken, res)
    if (validToken !== null) {
      return validToken
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, (err, decode) => {
      if (err) {
        console.log('err', err)
        return res.status(406).json({ success: false, message: 'not authorized' });
      }

      let token = jwt.sign(
        { _id: decode._id, email: decode.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_TTL }
      )

      let refresh = jwt.sign(
        { _id: decode._id, email: decode.email },
        process.env.JWT_SECRET_REFRESH,
        { expiresIn: process.env.JWT_TTL_REFRESH })


      return res.status(200).send({
        token,
        refresh
      })
    })

  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Auth/RefreshController.js',
    error: err?.message,
    method: 'refresh',
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

    //console.log('Error Gerado ', err)
    return res.status(501).end()
  }
}

const validateToken = (refreshToken, res) => {
  try {
    if (refreshToken == undefined || refreshToken == null) {
      return res.status(406).json({
        success: false,
        message: 'token not uninformed'
      }).end()
    }

    return null;

  } catch (err) {
    return res.status(501).end()
  }
}

module.exports = refresh
