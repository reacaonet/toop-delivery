const Group = require("../../models/GroupModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { tokenUser, franchise, franchises = [] } = req;

    const filter = {};

    filter.deletedAt = {
      $exists: false,
    };

    // restringe os dados a nivel da franquia
    filter.franchise = { $in: franchise ? [franchise] : [...franchises] };

    const list = await Group.find(filter).populate("franchise");

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Group/ListController.js',
    error: dadosDoErro?.message,
    method: 'ListController',
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
      message: "Falha ao encontrar Grupo",
      Error: dadosDoErro,
    });
  }
};
