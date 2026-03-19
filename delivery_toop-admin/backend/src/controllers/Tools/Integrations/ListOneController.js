const CompanyModel = require('../../../models/Company/CompanyModel');
const IntegrationsModel = require('../../../models/tools/IntegrationsModel');
const LogModel = require("../../../models/LogModel");

const listOne = async (req, res) => {
  try {
    const { company } = req.params;

    const response = await IntegrationsModel.findOne({
      company
    }).lean();

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Tools/Integrations/ListOneController.js',
      error: err?.message,
      method: 'listOne',
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
      message: 'Não foi possível processar informação',
      err: err.message,
    });
  }
};

module.exports = listOne;
