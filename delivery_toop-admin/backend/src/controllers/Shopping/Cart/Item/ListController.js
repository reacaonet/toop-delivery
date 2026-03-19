const mongoose = require("mongoose");
const Item = require("../../../../models/Shopping/CartItemModel");
const ProductComplementItem = require("../../../../models/Food/ProductComplementItemModel");
const AccessoriesComplementItem = require("../../../../models/Accessories/ProductComplementItemModel");
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const shoppingCart = req.params.cart;
    const { type, isDeleted, isComplement } = req.query;
    let filter = {};

    if (!mongoose.Types.ObjectId.isValid(shoppingCart)) {
      return res.status(400).send({
        message: "ID do carrinho inválido",
      });
    }

    let list = [];
    filter.shoppingCart = shoppingCart;

    if (isDeleted) {
      filter.$or = [{ isDeleted: false }, { isDeleted: { $ne: true } }];
    }

    if (type === "supermarket") {
      list = await Item.find(filter)
        .populate("shoppingCart", { status: 1, customer: 1, company: 1 })
        .populate("product", { images: 1, name: 1, barcode: 1, price: 1, pricePromotion: 1 })
        .lean();
    }

    if (type === "restaurant") {
      list = await Item.find(filter)
        .populate("shoppingCart", { status: 1, customer: 1, company: 1 })
        .populate("foodProduct", { images: 1, name: 1, codPdv: 1, price: 1, pricePromotion: 1 })
        .lean();
    }

    if (type === "accessories") {
      list = await Item.find(filter)
        .populate("shoppingCart", { status: 1, customer: 1, company: 1 })
        .populate("accessoriesProduct", { images: 1, name: 1, codPdv: 1, price: 1, pricePromotion: 1 })
        .lean();
    }

    if (!type || type == undefined) {
      list = await Item.find(filter)
        .populate("shoppingCart", { status: 1, customer: 1, company: 1 })
        .populate("foodProduct", { images: 1, name: 1, barcode: 1, price: 1, pricePromotion: 1 })
        .populate("product", { images: 1, name: 1, barcode: 1, price: 1, pricePromotion: 1 })
        .lean()
        .populate("accessoriesProduct", { images: 1, name: 1, codPdv: 1, price: 1, pricePromotion: 1 })
        .lean();
    }

    if (type && type === "restaurant" && isComplement) {
      list = await complementsRestaurants2(list);
    }

    if (type && type === "accessories" && isComplement) {
      list = await complementsAccessories(list);
    }

    return res.json(list);
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/Item/UpdateController.js',
      error: dadosDoErro?.message,
      method: 'UpdateController',
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
      message: "Falha ao listar Itens",
      Error: dadosDoErro,
    });
  }
};

const complementsRestaurants = async list => {
  try {
    for await (item of list) {
      item.foodProduct.complement = [];

      if (item.radio && item.radio.length > 0) {
        let ids = item.radio.map(radio => {
          try {
            return mongoose.Types.ObjectId(radio.id);
          } catch (err) { }
        });

        if (ids && ids.length > 0) {
          const respItem = await ProductComplementItem.aggregate([{ $match: { _id: { $in: ids } } }]);

          if (respItem) {
            for (const complement of respItem) {
              item.foodProduct.complement.push(complement);
            }
          }
        }
      } // If radio

      if (item.check && item.check.length > 0) {
        let ids = item.check.map(check => {
          try {
            return mongoose.Types.ObjectId(check.id);
          } catch (err) { }
        });

        if (ids && ids.length > 0) {
          const respItem = await ProductComplementItem.aggregate([{ $match: { _id: { $in: ids } } }]);

          if (respItem) {
            for (const complement of respItem) {
              item.foodProduct.complement.push(complement);
            }
          }
        }
      } // If check
    }

    return list;
  } catch (err) {
    return list;
  }
};

const complementsRestaurants2 = async list => {
  let result = list;
  try {
    for (let i = 0; i < result.length; i++) {
      result[i].foodProduct = { ...result[i].foodProduct, complement: [] };

      if (result[i].radio && result[i].radio.length > 0) {
        for (let ii = 0; ii < result[i].radio.length; ii++) {
          const radio = result[i].radio[ii];

          const respItem = await ProductComplementItem.aggregate([{ $match: { _id: mongoose.Types.ObjectId(radio.id) } }]);

          if (respItem) {
            for (complement of respItem) {
              result[i].foodProduct.complement.push(complement);
            }
          }
        }
      } // If radio

      if (result[i].check && result[i].check.length > 0) {
        for (let ii = 0; ii < result[i].check.length; ii++) {
          const check = result[i].check[ii];

          const respItem = await ProductComplementItem.aggregate([{ $match: { _id: mongoose.Types.ObjectId(check.id) } }]);

          if (respItem) {
            for (complement of respItem) {
              result[i].foodProduct.complement.push({ ...complement, quantity: check.quantity ? check.quantity : 0 });
            }
          }
        }
      } // If check
    }

    return result;
  } catch (err) {
    return result;
  }
};

const complementsAccessories = async list => {
  try {
    for await (item of list) {
      item.foodProduct.complement = [];

      if (item.radio && item.radio.length > 0) {
        let ids = item.radio.map(radio => {
          try {
            return mongoose.Types.ObjectId(radio.id);
          } catch (err) { }
        });

        if (ids && ids.length > 0) {
          const respItem = await AccessoriesComplementItem.aggregate([{ $match: { _id: { $in: ids } } }]);

          if (respItem) {
            for (const complement of respItem) {
              item.foodProduct.complement.push(complement);
            }
          }
        }
      } // If radio

      if (item.check && item.check.length > 0) {
        let ids = item.check.map(check => {
          try {
            return mongoose.Types.ObjectId(check.id);
          } catch (err) { }
        });

        if (ids && ids.length > 0) {
          const respItem = await AccessoriesComplementItem.aggregate([{ $match: { _id: { $in: ids } } }]);

          if (respItem) {
            for (const complement of respItem) {
              item.foodProduct.complement.push(complement);
            }
          }
        }
      } // If check
    }

    return list;
  } catch (err) {
    return list;
  }
};
