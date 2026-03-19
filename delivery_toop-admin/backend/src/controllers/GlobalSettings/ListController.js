const GlobalSettings = require('../../models/GlobalSettingsModel')
const LogModel = require("../../models/LogModel");

const listController = async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    return res.status(200).send(settings);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/GlobalSettings/ListController.js',
      error: err?.message,
      method: 'listController',
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
      message: err.message,
    });
  }
};

module.exports = listController;
