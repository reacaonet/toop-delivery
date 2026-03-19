const mongoose = require('mongoose');
const CartItem = require('../../../../models/Shopping/CartItemModel');
const LogModel = require("../../../../models/LogModel");

/**
 * POST
 * url - /shopping/cart-item/shopper/:shopper/card/:shoppingCart
 */
const addItemController = async (req, res) => {
  try {
    const { shopper, shoppingCart } = req.params;

    const {
      name,
      barcode,
      amount,
      price,
      type,
      product,
      foodProduct,
      accessoriesProduct,
    } = req.body;

    if (!shopper || !mongoose.isValidObjectId(shopper)) {
      return res.status(400).send({
        message: 'Informe o Shopper'
      });
    }

    if (!shoppingCart || !mongoose.isValidObjectId(shoppingCart)) {
      return res.status(400).send({
        message: 'Informe um carrinho válido'
      });
    }

    if (!name || !barcode) {
      return res.status(400).send({
        message: 'Informe os dados para alterar o produto'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).send({
        message: 'Informe uma quantidade'
      });
    }

    if (!price || price <= 0) {
      return res.status(400).send({
        message: 'Informe um Preço válido'
      });
    }

    if (!type || (type !== 'supermarket' && type !== 'restaurant' && type !== 'accessories')) {
      return res.status(400).send({
        message: 'Informe um tipo válido'
      });
    }

    let newItem = {};
    newItem.name = name;
    newItem.shoppingCart = shoppingCart,
      newItem.barcode = barcode;
    newItem.amount = amount;
    newItem.price = price;
    newItem.type = type;
    newItem.edited = false;
    newItem.addToShopper = true;
    newItem.shopperCheck = true;
    newItem.shopper = shopper;

    if (product) {
      newItem.product = product;
    }

    if (foodProduct) {
      newItem.foodProduct = foodProduct;
    }

    if (accessoriesProduct) {
      newItem.accessoriesProduct = accessoriesProduct;
    }

    let newResponse = await CartItem.create(newItem);
    return res.status(200).send(newResponse);

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/Item/AddItemController.js',
      error: err?.message,
      method: 'addItemController',
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
      err: 'Falha ao adicionar item',
      message: err.message,
    });
  }
}

module.exports = addItemController;
