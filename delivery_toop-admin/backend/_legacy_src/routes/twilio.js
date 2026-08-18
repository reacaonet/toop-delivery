const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const Twilio = require('../models/twilio');

module.exports = async (req, res) => {
  try {
    const data = req.body;
    const create = await Twilio.create(data);

    return res.json(create);
  } catch (dadosDoErro) {
    return res.status(400).send({
      message: "Falha ao tenntar criar um usuário de aviso",
      Error: dadosDoErro,
    });
  }
};
