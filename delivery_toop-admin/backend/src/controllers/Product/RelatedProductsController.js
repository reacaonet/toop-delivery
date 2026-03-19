const mongoose = require('mongoose');
const Product = require('../../models/ProductModel');
const LogModel = require("../../models/LogModel");

const related = async (req, res) => {
  try {
    const { productId } = req.query;
    const filter = {};

    filter.active = true;

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return res.status(400).send({
        message: 'Informe um produto válido'
      });
    }

    const productResponse = await Product.findById(productId).lean();

    if (!productResponse || !productResponse._id) {
      return res.status(200).send([]);
    }

    let departments = productResponse.department;
    filter.company = productResponse.company;
    let name = productResponse.name;

    filter._id = { $ne: productResponse._id };

    if (departments && departments.length >= 0) {
      filter.department = { $in: departments };
    }

    let relatedProduts = await Product.aggregate([
      {
        $match: filter
      },
      { $limit: 6 }
    ]);

    return res.status(200).send(relatedProduts);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Product/RelatedProductsController.js',
      error: err?.message,
      method: 'related',
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

    return res.status(200).send({
      message: 'Fail List Products related',
      err: err.message,
    });
  }
}

module.exports = related;
