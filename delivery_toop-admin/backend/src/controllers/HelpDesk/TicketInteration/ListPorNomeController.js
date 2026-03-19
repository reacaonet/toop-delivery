const TicketInteration = require('../../../models/HelpDesk/TicketInterationModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const listPorNome = req.query.listPorNome;
    if (listPorNome && (typeof listPorNome === 'string')) {
      list = await TicketInteration.find(
        { name: { $regex: '.*' + listPorNome.toLowerCase() + '.*', $options: 'i' } }, {name: 1});
      return res.json( list);
    } else {
      return res.json([]);
    }
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/HelpDesk/TicketInteration/ListPorNomeController.js',
    error: dadosDoErro?.message,
    method: 'ListPorNomeController',
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
      mesage: "Falha ao encontrar Ticket",
      error: dadosDoErro
    });
  }
};