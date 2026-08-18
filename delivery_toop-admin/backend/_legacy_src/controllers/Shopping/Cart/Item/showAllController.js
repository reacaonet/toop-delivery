/** libs */
const mongoose = require("mongoose");

/** Model */
const CartItem = require("../../../../models/Shopping/CartItemModel");
const ProductComplementItemModel = require("../../../../models/Food/ProductComplementItemModel");
const LogModel = require("../../../../models/LogModel");

/**
 * GET
 * url - /shopping/cart-item/show-all/:cart
 */
const showAll = async (req, res) => {
  try {
    const { cart } = req.params;

    if (!cart || !mongoose.isValidObjectId(cart)) {
      return res.status(400).send({
        message: "Informe um carrinho válido",
      });
    }

    let response = await CartItem.find({
      shoppingCart: cart,
      isDeleted: false,
    })
      .populate({
        path: "product",
        select: {
          name: 1,
          images: 1,
        },
      })
      .populate({
        path: "foodProduct",
        select: {
          name: 1,
          images: 1,
        },
      })
      .populate({
        path: "shopper",
        select: "person",
        populate: {
          path: "person",
          select: "name",
        },
      })
      .select({
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      })
      .lean();

    if (!response) {
      return res.status(400).send({
        message: "Informe um carrinho válido",
      });
    }

    let newItens = [];
    for await (const item of response) {
      const newRadios = [];
      for await (const itemRadio of item.radio) {
        const radio = await ProductComplementItemModel.findOne({ _id: itemRadio.id });
        newRadios.push({ ...itemRadio, name: radio.name });
      }
      newItens.push({ ...item, radio: newRadios });
    }
    response = newItens;

    newItens = [];
    for await (const item of response) {
      const newCheck = [];
      for await (const itemCheck of item.check) {
        const check = await ProductComplementItemModel.findOne({ _id: itemCheck.id });
        newCheck.push({ ...itemCheck, name: check.name });
      }
      newItens.push({ ...item, check: newCheck });
    }
    response = newItens;

    let removed = [];
    let added = [];
    let all = [];
    let index = 0;

    for await (const item of response) {
      if (item.isDeleted === true && item.edited === false && item.shopper) {
        let product = infoProduct(item);

        removed.push({
          product: {
            name: product.name,
            images: product.images,
            amount: item.amount,
            price: item.price,
            pricePromotion: item.pricePromotion || null,
            type: item.type,
            check: item.check,
            radio: item.radio,
          },
        });
      } else if (item.isDeleted === false && item.addToShopper) {
        let product = infoProduct(item);

        added.push({
          product: {
            name: product.name,
            images: product.images,
            amount: item.amount,
            price: item.price,
            pricePromotion: item.pricePromotion || null,
            type: item.type,
            check: item.check,
            radio: item.radio,
          },
        });
      } else if (item.isDeleted === false) {
        let product = infoProduct(item);

        all.push({
          index: index,
          product: {
            name: product.name,
            images: product.images,
            amount: item.amount,
            price: item.price,
            pricePromotion: item.pricePromotion || null,
            type: item.type,
            check: item.check,
            radio: item.radio,
          },
          editableItem: getEditableItem(item),
          isEditable: item.edited || false,
          editableVisble: false,
          shopper: getShopper(item),
        });

        index++;
      }
    }

    return res.status(200).send({
      itens: all,
      removed: removed,
      added: added,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/Item/showAllController.js',
      error: err?.message,
      method: 'showAll',
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
      message: "Não foi possível listar itens",
      err: err.message,
    });
  }
};

const infoProduct = item => {
  let product = {};

  if (item.name) {
    product.name = item.name;
  } else if (item.product && item.product.name) {
    product.name = item.product.name;
  } else {
    product.name = "";
  }

  if (item.images) {
    product.images = item.images;
  } else if (item.product && item.product.images) {
    product.images = item.product.images;
  } else {
    product.images = null;
  }

  return product;
};

const getEditableItem = item => {
  if (!item.editedFromItem || !item.editedFromItem._id) {
    return null;
  }

  let edit = item.editedFromItem;

  let product = {
    name: "",
    images: null,
    price: edit.price,
    pricePromotion: edit.pricePromotion || null,
    amount: edit.amount,
    type: edit.type,
  };

  if (edit.name) {
    product.name = edit.name;
  } else if (edit.product && edit.product.name) {
    product.name = edit.product.name;
  }

  if (edit.images) {
    product.images = edit.images;
  } else if (edit.product && edit.product.images) {
    product.images = edit.product.images;
  }

  return product;
};

const getShopper = item => {
  if (!item || !item.shopper || !item.shopper.person || !item.shopper.person.name) {
    return "";
  }

  return item.shopper.person.name;
};

module.exports = showAll;
