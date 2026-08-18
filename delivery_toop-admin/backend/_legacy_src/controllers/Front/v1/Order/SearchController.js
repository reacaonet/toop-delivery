const mongoose = require('mongoose');
const Order = require('../../../../models/Shopping/order/orderStatusModel');
// const Cart = require('../../../../models/Shopping/CartModel');
const CartItem = require('../../../../models/Shopping/CartItemModel');
const ProductComplementItem = require('../../../../models/Food/ProductComplementItemModel');
const LogModel = require("../../../../models/LogModel");

/**
 * GET
 * url - /v1/front/order/search/params
*/
const one = async (req, res) => {
  try {
    const { shoppingCart } = req.query;
    let match = {};

    if (!shoppingCart || !mongoose.isValidObjectId(shoppingCart)) {
      return res.status(400).send({
        message: 'Inform order valid'
      });
    }

    match.shoppingCart = mongoose.Types.ObjectId(shoppingCart);

    let aggregate = [];

    let customerLook = {
      from: "customer",
      let: { customerId: "$customer" },
      as: "customer",
      pipeline: [
        {
          $match: { $expr: { $eq: ["$_id", "$$customerId"] } },
        },
        { $limit: 1 },
        { $project: { person: 1, email: 1, } },
      ],
    };

    let person = {
      from: "person",
      let: { personId: "$customer.person" },
      as: "customer.person",
      pipeline: [
        {
          $match: { $expr: { $eq: ["$_id", "$$personId"] } },
        },
        { $limit: 1 },
        { $project: { name: 1, phone: 1 } },
      ],
    };

    let customerDelivery = {
      from: "customer_delivery_address",
      let: { deliveryId: "$customerDelivery" },
      as: "customerDelivery",
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$deliveryId"] } } },
        { $limit: 1 },
        {
          $project: {
            address: 1,
            number: 1,
            complement: 1,
            referencePoint: 1,
            location: 1,
          }
        },
      ],
    };

    let payment = {
      from: "payment",
      let: { paymentId: "$payment" },
      as: "payment",
      pipeline: [
        {
          $project: {
            'idArray': {
              $cond: {
                // ultimo id Payment como principal
                if: { $isArray: ["$$paymentId"] }, then: "$$paymentId", else: ["$$paymentId"],
              },
            },
            total: 1,
            totalCompany: 1,
            priceDelivery: 1,
            serviceCharge: 1,
            coupon: 1,
            couponPrice: 1,
            cashChange: 1,
            status: 1,
            typePayment: 1,
            typePaymentId: 1,
            fncTypePayment: 1,
            valueTip: 1,
          }
        },
        {
          $match: {
            $expr: { $in: ["$_id", [{ $arrayElemAt: ["$idArray", -1] }]] }
          },
        },
        {
          $lookup: {
            from: "fnc_typePayments",
            let: { id: "$typePaymentId" },
            as: "fncTypePayment",
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id"] }
                }
              },
              { $project: { image: 1, type: 1, name: 1, brand: 1 } },
              { $limit: 1 }
            ],
          },
        },
        { $unwind: { path: "$fncTypePayment", preserveNullAndEmptyArrays: true } },
        { $limit: 1 },
      ],
    };

    let companyLook = {
      from: "company",
      let: { companyId: "$company" },
      as: "company",
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$_id", "$$companyId"]
            }
          },
        },
        { $limit: 1 },
        {
          $project: {
            name: 1,
            images: 1,
            type: 1,
            location: 1,
          }
        },
      ],
    };

    // Cart
    let cart = {
      from: "shoppingCart",
      let: { id: "$shoppingCart" },
      as: "shoppingCart",
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$_id", "$$id"]
            }
          },
        },
        { $limit: 1 },
        {
          $project: {
            schedule: 1,
          }
        }
      ],
    };

    aggregate.push({ $match: match });

    aggregate.push({ $lookup: customerLook });
    aggregate.push({ $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } });
    aggregate.push({ $lookup: person });
    aggregate.push({ $lookup: customerDelivery });
    aggregate.push({ $lookup: payment });
    aggregate.push({ $lookup: companyLook });
    aggregate.push({ $lookup: cart });

    aggregate.push({ $unwind: { path: "$customerDelivery", preserveNullAndEmptyArrays: true } });
    aggregate.push({ $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } });
    aggregate.push({ $unwind: { path: "$company", preserveNullAndEmptyArrays: true } });
    aggregate.push({ $unwind: { path: "$shoppingCart", preserveNullAndEmptyArrays: true } });

    aggregate.push({ $limit: 1 });

    const responseOrder = await Order.aggregate(aggregate);

    if (responseOrder && responseOrder.length == 1) {
      let cart = await itensOrder(responseOrder[0].shoppingCart, responseOrder[0].company.type);

      return res.status(200).send({
        order: responseOrder[0],
        cart: cart,
      });
    }

    return res.status(200).send({});
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Front/v1/Order/SearchController.js',
      error: err?.message,
      method: 'one',
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
      message: 'Fail List One',
      err: err.message,
    });
  }
};


const itensOrder = async (cartId, companyType) => {
  try {
    const response = await responseCartItens(cartId, companyType);

    return response;
  } catch (err) {
    return {};
  }
};

const responseCartItens = async (cartId, companyType) => {
  let cartItens = [];

  if (companyType === 'restaurant' || companyType === 'accessories') {
    const path = companyType === 'restaurant' ? 'foodProduct' : 'accessoriesProduct';

    cartItens = await CartItem
      .find({
        shoppingCart: cartId,
        isDeleted: false,
      })
      .populate({
        path: path,
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
      .select({
        radio: 1,
        check: 1,
        amount: 1,
        shoppingCart: 1,
        comment: 1,
        foodProduct: 1,
        price: 1,
        pricePromotion: 1,
        active: 1,
        edited: 1,
        editedFromItem: 1,
        name: 1,
        images: 1,
        type: 1,
      })
      .lean();
  } else {
    cartItens = await CartItem
      .find({
        shoppingCart: cartId,
        isDeleted: false,
      })
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
      .select({
        radio: 1,
        check: 1,
        amount: 1,
        shoppingCart: 1,
        comment: 1,
        product: 1,
        price: 1,
        pricePromotion: 1,
        active: 1,
        edited: 1,
        editedFromItem: 1,
        name: 1,
        images: 1,
        barcode: 1,
        type: 1,
      })
      .lean();
  }

  cartItens = cartItens.filter(item => {
    if (item && item.product && item.product._id &&
      (!item.product.deletedAt || item.product.deletedAt === false)) {
      return item;
    } else if (item && item.foodProduct && item.foodProduct._id &&
      (!item.foodProduct.deletedAt || item.foodProduct.deletedAt === false)) {
      return item;
    }
  });

  for await (let cartItem of cartItens) {
    checks = await getComplementsCheck(cartItem);
    radio = await getComplementsRadio(cartItem);
    cartItem.complements = [...checks, ...radio];
  }

  return cartItens;
}

const getComplementsRadio = async (item) => {
  try {
    let radios = item.radio;
    let complements = [];

    if (!radios || radios.length <= 0) {
      return [];
    }

    for await (radio of radios) {
      let item = await ProductComplementItem
        .findById(radio.id)
        .populate('foodProductComplement', {
          _id: 0,
          name: -1,
          category: -1,
        })
        .select({
          codPdv: 1,
          description: 1,
          foodProductComplement: 1,
          name: 1,
          price: 1,
        })
        .lean();

      if (radio && radio.price) {
        item.price = radio.price;
      }

      complements.push(item);
    }

    return complements;
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getComplementsCheck = async (item) => {
  try {
    let checks = item.check;
    let complements = [];

    if (!checks || checks.length <= 0) {
      return [];
    }

    for await (check of checks) {
      let item = await ProductComplementItem
        .findById(check.id)
        .populate('foodProductComplement', {
          _id: 0,
          name: -1,
          category: -1,
        })
        .select({
          codPdv: 1,
          description: 1,
          foodProductComplement: 1,
          name: 1,
          price: 1,
        })
        .lean();

      if (check && check.price) {
        item.price = check.price;
      }

      complements.push(item);
    }

    return complements;
  } catch (err) {
    return [];
  }
};

module.exports = one;
