const mongoose = require('mongoose');
const CartItem = require('../../../../models/Shopping/CartItemModel');
const LogModel = require("../../../../models/LogModel");

/**
 * PUT
 * url - /shopping/cart-item/shopper/:shopper/item/:itemId
 */
const changeItem = async (req, res) => {
  try {
    const { shopper, itemId } = req.params;
    const { type, action } = req.body;

    if (!shopper || !mongoose.isValidObjectId(shopper)) {
      return res.status(400).send({
        message: 'Informe o Shopper'
      });
    }

    if (!itemId || !mongoose.isValidObjectId(itemId)) {
      return res.status(400).send({
        message: 'Informe o Item a ser editado'
      });
    }

    if (!action || (action !== 'edit' && action !== 'replace')) {
      return res.status(400).send({
        message: 'Informe uma ação válida'
      });
    }

    if (!type || (type !== 'supermarket' && type !== 'restaurant' && type !== 'accessories')) {
      return res.status(400).send({
        message: 'Informe um tipo válido'
      });
    }

    if (action === 'edit') {
      return await actionEdit(req, res, shopper, itemId);
    }

    return await actionReplace(req, res, shopper, itemId);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/Item/ChangeItemController.js',
      error: err?.message,
      method: 'changeItem',
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
      err: 'Falha ao substituir item',
      message: err.message,
    });
  }
}

const actionReplace = async (req, res, shopper, itemId) => {
  try {
    const {
      name,
      barcode,
      amount,
      price,
      type,
      product,
      foodProduct,
    } = req.body;

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

    let itemResponse = await getProduct(itemId, type);

    if (!itemResponse) {
      return res.status(400).send({
        message: 'Item não encontrado ou não é possível realizar alteração',
      });
    }

    if (itemResponse.isDeleted === true) {
      return res.status(400).send({
        message: 'Não é possível alterar um item já deletado',
      });
    }

    // Marcar antigo como deletado
    await CartItem.updateOne({ _id: itemId }, {
      isDeleted: true,
      shopper: shopper,
      edited: true,
    });

    let newItem = {};

    newItem.name = name;
    newItem.shoppingCart = itemResponse.shoppingCart,
      newItem.barcode = barcode;
    newItem.amount = amount;
    newItem.price = price;
    newItem.type = type;
    newItem.edited = true;
    newItem.shopperCheck = true;
    newItem.editedFromItem = itemResponse;
    newItem.shopper = shopper;

    if (product) {
      newItem.product = product;
    }

    if (foodProduct) {
      newItem.foodProduct = foodProduct;
    }

    let newResponse = await CartItem.create(newItem);
    return res.status(200).send(newResponse);

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/Item/ChangeItemController.js',
      error: err?.message,
      method: 'actionReplace',
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
      message: 'Não foi possível substituir item',
      err: err.message,
    });
  }
};

const actionEdit = async (req, res, shopper, itemId) => {
  try {
    let { amount, price, type, product, foodProduct } = req.body;

    if (!price || price <= 0) {
      return res.status(400).send({
        message: 'Informe um Preço válido'
      });
    }

    if (!amount || price <= 0) {
      return res.status(400).send({
        message: 'Informe um Preço válido'
      });
    }

    if (!type || (type !== 'supermarket' && type !== 'restaurant' && type !== 'accessories')) {
      return res.status(400).send({
        message: 'Informe um tipo válido'
      });
    }

    let cartItem = await CartItem.findById(itemId).lean();

    if (!cartItem) {
      return res.status(400).send({
        message: 'Item não encontrado ou não é possível realizar alteração',
      });
    }

    let itemResponse = await getProduct(itemId, type);

    if (!itemResponse) {
      return res.status(400).send({
        message: 'Item não encontrado ou não é possível realizar alteração',
      });
    }

    if (itemResponse.isDeleted === true) {
      return res.status(400).send({
        message: 'Não é possível alterar um item já deletado',
      });
    }

    // Marcar antigo como deletado
    await CartItem.updateOne({ _id: itemId }, {
      isDeleted: true,
      shopper: shopper,
      edited: true,
    });

    cartItem.amount = amount;
    cartItem.price = price;
    cartItem.type = type;
    cartItem.shoppingCart = itemResponse.shoppingCart,
      cartItem.edited = true;
    cartItem.shopperCheck = true;
    cartItem.editedFromItem = itemResponse;
    cartItem.shopper = shopper;

    delete cartItem._id, cartItem.createdAt, cartItem.updatedAt;

    if (product) {
      cartItem.product = product;
    }

    if (foodProduct) {
      cartItem.foodProduct = foodProduct;
    }

    let newResponse = await CartItem.create(cartItem);
    return res.status(200).send(newResponse);

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/Item/ChangeItemController.js',
      error: err?.message,
      method: 'actionEdit',
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
      message: 'Não foi possível editar item',
      err: err.message,
    });
  }
};

const getProduct = async (itemId, type) => {
  let itemResponse = null;
  if (type === 'supermarket') {
    itemResponse = await CartItem.findById(itemId)
      .populate({
        path: 'product',
        select: {
          images: 1,
          name: 1,
          barcode: 1,
          description: 1,
          price: 1,
          pricePromotion: 1,
        }
      })
      .lean();
  } else {
    itemResponse = await CartItem.findById(itemId)
      .populate({
        path: 'foodProduct',
        select: {
          images: 1,
          name: 1,
          category: 1,
          description: 1,
        },
        populate: {
          path: 'category',
          select: { _id: 0, name: 1 },
        },
      })
      .lean();
  }

  return itemResponse;
}

module.exports = changeItem;
