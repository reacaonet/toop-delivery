const mongoose = require("mongoose");
const Cart = require("../../../models/Shopping/CartModel");
const CartItem = require("../../../models/Shopping/CartItemModel");
const ProductComplementItem = require('../../../models/Food/ProductComplementItemModel');
const LogModel = require("../../../models/LogModel");

const cartReorder = async (req, res) => {
  try {
    const { cart } = req.params
    const { type } = req.query

    if (!cart || !mongoose.isValidObjectId(cart)) {
      return res.status(400).send({ message: 'Informe um carrinho válido' })
    }

    if (!type || (type !== 'MENU' && type !== 'PRODUCT')) {
      return res.status(400).send({ message: 'Informe o fluxo de compra' })
    }

    const respCart = await Cart.findOne({
      _id: cart,
      isDeleted: false
    }).lean();

    if (!respCart || !respCart._id) {
      return res.status(400).send({
        message: 'Carrinho de compra não encontrado ou não disponivel para refazer pedido'
      })
    }

    const aggregate = [
      {
        $match: {
          shoppingCart: mongoose.Types.ObjectId(cart),
          isDeleted: false,
        }
      }
    ];

    // Fluxo de Compra MENU
    if (type === 'MENU') {
      aggregate.push({
        $lookup: {
          from: 'foodProduct',
          let: { id: "$foodProduct" },
          as: "product",
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $limit: 1 }
          ]
        }
      });
    } else {
      aggregate.push({
        $lookup: {
          from: 'product',
          let: { id: "$product" },
          as: "product",
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $limit: 1 }
          ]
        }
      });
    }

    aggregate.push({
      $unwind: { path: "$product", preserveNullAndEmptyArrays: true }
    });

    const itens = await CartItem.aggregate(aggregate);

    if (!itens || itens.length <= 0) {
      return res.status(400).send({
        message: 'Não é possível refazer o pedido itens no carrinho de compra esta vazio'
      });
    }

    for await (const cardProd of itens) {
      delete cardProd._id
      delete cardProd.createdAt
      delete cardProd.updatedAt

      if (cardProd.product && cardProd.product.price) {
        cardProd.price = cardProd.product.price
      }

      if (cardProd.product && cardProd.product.pricePromotion) {
        cardProd.pricePromotion = cardProd.product.pricePromotion
      } else {
        cardProd.pricePromotion = 0
      }

      if (cardProd.check) {
        cardProd.check = await mapPriceComplements(cardProd.check)
      }

      if (cardProd.radio) {
        cardProd.radio = await mapPriceComplements(cardProd.radio)
      }
    }

    respCart.status = 'pending'
    delete respCart._id
    delete respCart.createdAt
    delete respCart.updatedAt
    delete respCart.fingerPrintId

    // Criar novo Carrinho
    const createCart = await Cart.create(respCart);

    if (!createCart || !createCart._id) {
      return res.status(400).send({
        message: 'Não foi possível refazer o carrinho de compra'
      })
    }

    // Criar os Itens do Carrinho
    for await (const cardProd of itens) {
      try {
        cardProd.shoppingCart = createCart._id
        const productId = cardProd.product._id

        console.log('productId', productId);

        delete cardProd.product;
        console.log('productId', productId);

        if (cardProd.type === 'restaurant') {
          cardProd.foodProduct = productId
        } else {
          cardProd.product = productId
        }
        await CartItem.create(cardProd)
        // console.log('Criado com sucesso', respItem._id)
      } catch (err) {
        console.log('Fail create item cart ', err)
      }
    }

    return res.status(200).send(createCart)
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/CartReorder.js',
      error: err?.message,
      method: 'cartReorder',
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
      message: 'Não foi possível refazer o carrinho',
      err: err.message
    })
  }
}

const mapPriceComplements = async (complement) => {
  try {
    if (!complement && !Array.isArray(complement) && complement.length <= 0) {
      return complement;
    }

    for await (const item of complement) {
      const current = await ProductComplementItem.findById(item.id).select({
        price: 1
      }).lean()

      if (
        current && current._id && current.price !== item.price &&
        Number(current.price) >= 0
      ) {
        item.price = current.price
      }
    }

    return complement
  } catch (err) {
    console.log('err', err)
    return complement
  }
}

module.exports = cartReorder
