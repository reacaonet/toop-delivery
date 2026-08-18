const EcbrImageBank = require('../../../models/ProductDepartment/EcbrProductDepartment');
const LogModel = require("../../../models/LogModel");

const ListByBarcode = async (req, res) => {
  try {
    const barcode = req.params;
    console.log({ barcode });

    const productBanck = await EcbrImageBank.find(barcode)

    if (productBanck.length === 0) {
      return res.status(200).send({
        status: 404,
        message: 'Codigo de barras não encontrado'
      });
    }

    // const response = await Topic.find(filter).lean();
    return res.status(200).send({
      data: productBanck[0],
      status: 200,
      message: 'Codigo de barras encontrado'
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/EcbrBackImage/ListByBarcode.js',
      error: err?.message,
      method: 'ListByBarcode',
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
      message: 'Falha ao encontrar codigo de barras',
      err: err.message,
    });
  }
};

module.exports = ListByBarcode;
