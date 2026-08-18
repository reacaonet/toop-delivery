const mongoose = require('mongoose');

const ProductModel = require('../../models/ProductModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    const company = req.company;

    if (!company || !mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).send({
        message: "Falha ao validar a company vinculada ao usuário!",
      });
    }

    data.company = company;

    if (!data.file || (typeof data.file !== 'object')) {
      return res.status(400).send({
        message: 'Imagens inválidas'
      });
    }

    if (data.status && (`${data.status}` === 'true' || `${data.status}` === 'false')) {
      data.status = `${data.status}` === 'true' ? true : false
    } else {
      data.status = false
    }

    data.images = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images.push(data.url)
    }

    const product = await ProductModel.create(data);

    return res.send({
      status: 200,
      message: "Produto criado com sucesso",
      data: product
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Product/CreateController.js',
      error: err?.message,
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

    console.log('error', err)
    return res.status(400).send({
      message: "Falha ao criar Produto",
      error: err.message
    });
  }
};
