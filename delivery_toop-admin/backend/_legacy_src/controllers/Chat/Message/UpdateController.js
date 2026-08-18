const ChatMessage = require('../../../models/chatMessageModel');
const LogModel = require("../../../models/LogModel");

const updateRead = async (req, res) => {
  try {
    let { read, cartId, personId } = req.body;

    if (!read || !personId) {
      return res.status(400).send({
        message: 'Não foi possível atualizar ....'
      });
    }

    await ChatMessage.updateMany({
      shoppingCart: cartId,
      personSendId: personId
    }, {
      read: read
    });

    return res.status(200).send({});
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Chat/Message/UpdateController.js',
      error: err?.message,
      method: 'updateRead',
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
      message: 'Fail update message'
    });
  }
}

module.exports = { updateRead };
