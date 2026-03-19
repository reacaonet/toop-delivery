const mongoose = require('mongoose');
const Item = require('../../../../models/Shopping/CartItemModel');
const LogModel = require("../../../../models/LogModel");

const checkItem = async (req, res) => {
  try {
    const { shopper } = req.params;
    const { itemId } = req.body

    if (!shopper || !mongoose.isValidObjectId(shopper)) {
      return res.status(400).send({
        message: 'Informe um shopper válido'
      });
    }

    if (!itemId || !mongoose.isValidObjectId(itemId)) {
      return res.status(400).send({
        message: 'Item não informado ou não encontrado ...'
      });
    }

    let item = await Item.findById(itemId);

    if (item && item.shopperCheck) {
      item.shopper = shopper;
      item.shopperCheck = false;
    } else {
      item.shopper = shopper;
      item.shopperCheck = true;
    }

    await item.save();
    return res.status(200).send(item);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/Item/UpdateShopper.js',
      error: err?.message,
      method: 'checkItem',
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
      message: err.message
    });
  };
}

const deleteItem = async (req, res) => {
  try {

    const { shopper, itemId } = req.params;

    if (!shopper || !mongoose.isValidObjectId(shopper)) {
      return res.status(400).send({
        message: 'Informe um shopper válido'
      });
    }

    if (!itemId || !mongoose.isValidObjectId(itemId)) {
      return res.status(400).send({
        message: 'Item não informado ou não encontrado ...'
      });
    }

    let item = await Item.findById(itemId);

    if (!item) {
      return res.status(200).send({});
    }

    item.shopper = shopper;
    item.isDeleted = true;

    item = await item.save();

    return res.status(200).send(item);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/Item/UpdateShopper.js',
      error: err?.message,
      method: 'deleteItem',
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
      message: 'unable to process information',
    });
  };
};

module.exports = { checkItem, deleteItem };
