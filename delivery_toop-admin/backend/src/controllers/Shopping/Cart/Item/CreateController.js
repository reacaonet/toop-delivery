const mongoose = require("mongoose");
const Item = require("../../../../models/Shopping/CartItemModel");
const Product = require("../../../../models/ProductModel");
const FoodProduct = require("../../../../models/Food/ProductModel");
const AccessoriesProduct = require("../../../../models/Accessories/ProductModel");
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const cart = req.params.cart;
    const product = req.params.product;

    const { amount, price, pricePromotion, type, check, radio, shopperCheck, shopper, comment, isPizza, size, pieces, flavors, billing_mode } = req.body;

    if (!mongoose.Types.ObjectId.isValid(cart) || !mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).send({
        message: "ID do Carrinho e/ou Produto inválidos",
      });
    }

    if (!amount || typeof price !== "number" || price < 0) {
      return res.status(400).send({
        message: "Payload inválido",
        payload: {
          amount: "Number - required",
          price: "Number - required",
          pricePromotion: "Number - opcional",
        },
      });
    }

    // Check se já existe o produto
    let checkItem = null;
    if (type === "supermarket") {
      checkItem = await Item.findOne({
        shoppingCart: cart,
        product,
        isDeleted: false,
      }).lean();
    }

    if (checkItem) {
      return res.status(400).send({
        message: "Já existe um item em andamento para esse cliente neste Carrinho de Compras!",
        item: checkItem,
      });
    }

    let addItens;

    if (type === "supermarket") {
      addItens = {
        shoppingCart: cart,
        amount,
        price,
        pricePromotion,
        type,
        shopperCheck,
        shopper,
      };

      let responseProd = await Product.findById(product)
        .select({
          _id: 1,
          name: 1,
          barcode: 1,
          images: 1,
        })
        .lean();

      if (responseProd) {
        addItens.product = responseProd._id;
        addItens.name = responseProd.name;
        addItens.barcode = responseProd.barcode;

        if (responseProd.images && responseProd.images.length > 0) {
          addItens.images = responseProd.images;
        }
      } else {
        addItens.product = product;
      }
    } else if (type === "restaurant") {
      addItens = {
        shoppingCart: cart,
        amount,
        price,
        pricePromotion,
        type,
        check,
        radio,
        shopperCheck,
        shopper,
        comment,
        size,
        pieces,
        flavors,
        isPizza,
        billing_mode,
      };

      let responseProd = await FoodProduct.findById(product)
        .select({
          _id: 1,
          name: 1,
          images: 1,
        })
        .lean();

      if (responseProd) {
        addItens.foodProduct = responseProd._id;
        addItens.name = responseProd.name;

        if (responseProd.images && responseProd.images.length > 0) {
          addItens.images = responseProd.images;
        }
      } else {
        addItens.foodProduct = product;
      }
    } else if (type === "accessories") {
      addItens = {
        shoppingCart: cart,
        amount,
        price,
        pricePromotion,
        type,
        check,
        radio,
        shopperCheck,
        shopper,
        comment,
      };

      let responseProd = await AccessoriesProduct.findById(product)
        .select({
          _id: 1,
          name: 1,
          images: 1,
        })
        .lean();

      if (responseProd) {
        addItens.accessoriesProduct = responseProd._id;
        addItens.name = responseProd.name;

        if (responseProd.images && responseProd.images.length > 0) {
          addItens.images = responseProd.images;
        }
      } else {
        addItens.accessoriesProduct = product;
      }
    }

    let item = await Item.create(addItens);
    if (item) {
      item = await item.populate("product").execPopulate();
    }

    return res.send({
      status: 200,
      message: "Item adicionado ao Carrinho com sucesso",
      data: item,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/Item/CreateController.js',
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

    return res.status(400).send({
      message: "Falha ao adicionar Item ao Carrinho de Compras",
      err: err.message,
    });
  }
};
