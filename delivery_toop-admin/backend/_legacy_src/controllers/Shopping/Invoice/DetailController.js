const Invoice = require('../../../services/Invoice/DetailInvoice');
const LogModel = require("../../../models/LogModel");

const DetailController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'Inform one invoice valid'
      });
    }

    let response = await Invoice(id);
    return res.status(200).json(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Invoice/DetailController.js',
      error: err?.message,
      method: 'DetailController',
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

    return res.status(400).json({
      message: 'Fail Detail Invoice',
      err: err.message
    });
  }
};

module.exports = DetailController;
