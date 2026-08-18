const Popup = require("../../../models/tools/PopupModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    // const { company, companies = [] } = req;

    const filter = {};
    filter.deletedAt = {
      $exists: false,
    };

    // restringe os dados a nivel da franquia

    const list = await Popup.find(filter).populate("company", { name: 1 });

    return res.json(list);
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/Tools/Popup/ListController.js',
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
      message: "Falha ao encontrar Popup",
      Error: dadosDoErro,
    });
  }
};
