const BrazilianBanks = require("../../../models/Setting/BrazilianBanks");
const LogModel = require("../../../models/LogModel")

module.exports = async (req, res) => {
  try {
    const { name, status } = req.query;

    let filter = {};

    if (name) {
      const decodeName = decodeURIComponent(name);
      filter.long_name = {
        $regex: '.*' + decodeName.toLowerCase() + '.*', $options: 'i'
      };
    }

    const list = await BrazilianBanks.find(filter, {_id: 1, compe: 1, long_name: 1, short_name: 1});

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/v2/Setting/ListBrazilianBanks.js',
    error: dadosDoErro?.message,
    method: 'ListBrazilianBanks',
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
      message: "Falha ao listar Empresas",
      Error: dadosDoErro.message,
    });
  }
};
