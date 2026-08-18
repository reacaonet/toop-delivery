/** Lib */
const mongoose = require('mongoose');
const moment = require('moment');

/** Model */
const AlertProduct = require('../../../../models/Customer/AlertProduct/AlertProduct');
const Product = require('../../../../models/ProductModel');
const LogModel = require("../../../../models/LogModel");


/**
 * PUT
 * URL - /v2/customer-alert-product/alert-product/notification/:idAlert
 */
const update = async (req, res) => {
  try {
    const { idAlert } = req.params;
    const { product } = req.body;

    if (!idAlert && !mongoose.isValidObjectId(idAlert)) {
      return res.status(400).send({
        message: 'Informe um alerta válido',
      });
    }

    if (!product && !mongoose.isValidObjectId(product)) {
      return res.status(400).send({
        message: 'Informe um produto válido',
      });
    }

    let productResponse = await Product.findById(product).lean();

    if (!productResponse || !productResponse._id) {
      return res.status(400).send({
        message: 'Informe um produto válido',
      });
    }

    let unfollowedAt = moment().utc().toDate();

    let alertResponse = await AlertProduct.findOneAndUpdate({ _id: idAlert }, {
      unfollowedAt,
      active: false,
    }, {
      upsert: true,
      new: true
    });

    return res.status(200).send(alertResponse);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Customer/AlertProduct/UpdateController.js',
      error: err?.message,
      method: 'update',
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
      message: 'Não foi possível atualizar',
      err: err.message,
    });
  }
};

module.exports = update;
