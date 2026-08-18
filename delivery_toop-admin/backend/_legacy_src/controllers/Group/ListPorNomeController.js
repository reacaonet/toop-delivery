const Group = require("../../models/GroupModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const nome = req.params.nome;
    const { franchise, franchises = [] } = req;

    let filter = {};
    filter.franchise = { $in: franchise ? [franchise] : [...franchises] };

    if (nome != null) {
      list = await Group.find({
        name: { $regex: ".*" + nome.toLowerCase() + ".*", $options: "i" },
        ...filter,
        deletedAt: {
          $exists: false,
        },
      });
    } else {
      list = await Group.find({
        ...filter,
        deletedAt: {
          $exists: false,
        },
      });
    }
    return res.json({ lista: list });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Group/ListPorNomeController.js',
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
      mesage: "Falha ao encontrar Grupos",
      error: dadosDoErro,
    });
  }
};
