/** Lib */
const mongoose = require('mongoose');

/** Model */
const AlertProduct = require('../../../../models/Customer/AlertProduct/AlertProduct');
const Product = require('../../../../models/ProductModel');
const LogModel = require("../../../../models/LogModel");

/**
 * POST
 * URL - /v2/customer-alert-product/alert-product/notification
 */
const create = async (req, res) => {
  try {
    const {
      company, customer, product,
    } = req.body;

    if (!company && !mongoose.isValidObjectId(company)) {
      return res.status(400).send({
        message: 'Informe uma empresa válida',
      });
    }

    if (!customer && !mongoose.isValidObjectId(customer)) {
      return res.status(400).send({
        message: 'Informe um usuário válido',
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

    let alertResponse = await AlertProduct.findOne({
      customer,
      product,
      company,
    })
    .sort({ followingAt: -1 })
    .lean();

    if (!alertResponse || alertResponse.active === false ) {
      let priceClick = productResponse.price;
      if ( productResponse.pricePromotion && productResponse.pricePromotion > 0 ) {
        priceClick = productResponse.pricePromotion;
      }

      alertResponse = await AlertProduct.create({
        company,
        customer,
        product,
        barcode: productResponse.barcode,
        priceClick,
      });
    }

    return res.status(200).send(alertResponse);
  } catch (err) {
    await LogModel.create({
      path: '',
      error: err?.message,
      method: '',
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
      message: 'Não foi possível adicionar',
      err: err.message,
    });
  }
};

module.exports = create;
