const Tip = require("../../models/TipModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;

    let tip = await Tip.create(data);

    return res.send({
      status: 200,
      message: "Gorjeta criada com sucesso",
      data: tip,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Tip/CreateController.js',
    error: dadosDoErro?.message,
    method: 'CreateController',
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
      message: "Falha ao criar Gorjeta",
      Error: dadosDoErro,
    });
  }
};
