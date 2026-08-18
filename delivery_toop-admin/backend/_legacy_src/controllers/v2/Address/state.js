/* Model */
const StateModel = require('../../../models/Address/StateModel')
const LogModel = require("../../../models/LogModel");

const listState = async (req, res) => {
  try {

    const list = await StateModel
      .find({})
      .sort({
        nome: 1,
      })
      .lean()

    return res.status(200).send(list)
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Address/state.js',
      error: err?.message,
      method: 'state',
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
      message: 'Não foi possível listar os estados',
      err: err.message
    })
  }
}

module.exports = listState;
