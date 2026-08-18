const mongoose = require('mongoose');
const Product = require('../../models/ProductModel');
const LogModel = require("../../models/LogModel");

const barCode = async (req, res) => {
  try {
    const { company, barcode } = req.params;

    if (!company || !barCode) {
      return res.status(400).send({
        message: 'Informe o código de barra'
      });
    }

    if (!mongoose.isValidObjectId(company) || barcode.length <= 2) {
      return res.status(400).send({
        message: 'Informe o código de barra válido'
      });
    }

    let product = await Product.findOne({
      company: company,
      //barcode: {$regex: new RegExp(barcode, 'i')},
      barcode: barcode,
    });
    return res.status(200).send(product);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Product/barCode.js',
      error: err?.message,
      method: 'barCode',
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
      message: 'Não foi possível localizar produto',
      err: err.message,
    });
  }
};

module.exports = { barCode };
