const mongoose = require("mongoose");
const Order = require("../../../../models/Shopping/order/orderStatusModel");
// const Cart = require('../../../../models/Shopping/CartModel');
const CartItem = require("../../../../models/Shopping/CartItemModel");
const ProductModel = require("../../../../models/Food/ProductModel");
const CategoryModel = require("../../../../models/Food/CategoryModel");
const ProductComplementItem = require("../../../../models/Food/ProductComplementItemModel");
const AccessoriesComplementItem = require("../../../../models/Accessories/ProductComplementItemModel");
const LogModel = require("../../../../models/LogModel");
/**
 * GET
 * url - /v1/front/order/:orderId
 */
const one = async (req, res) => {
  try {
    const { orderId } = req.params;
    let match = {};

    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).send({
        message: "Inform order valid",
      });
    }

    match._id = mongoose.Types.ObjectId(orderId);

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
        { $project: { person: 1, email: 1 } },
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
            streetNumber: 1,
            complement: 1,
            referencePoint: 1,
            location: 1,
          },
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
            idArray: {
              $cond: {
                // ultimo id Payment como principal
                if: { $isArray: ["$$paymentId"] },
                then: "$$paymentId",
                else: ["$$paymentId"],
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
            freeShippingBonus: 1,
          },
        },
        {
          $match: {
            $expr: { $in: ["$_id", [{ $arrayElemAt: ["$idArray", -1] }]] },
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
                  $expr: { $eq: ["$_id", "$$id"] },
                },
              },
              { $project: { image: 1, type: 1, name: 1, brand: 1 } },
              { $limit: 1 },
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
              $eq: ["$_id", "$$companyId"],
            },
          },
        },
        { $limit: 1 },
        {
          $project: {
            name: 1,
            images: 1,
            type: 1,
            location: 1,
            shoppingFlow: 1,
          },
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
              $eq: ["$_id", "$$id"],
            },
          },
        },
        { $limit: 1 },
        {
          $project: {
            schedule: 1,
          },
        },
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
      let companyType = "restaurant";
      if (responseOrder[0].company && responseOrder[0].company.shoppingFlow === "PRODUCT") {
        companyType = "supermarket";
      }

      let cart = await itensOrder(responseOrder[0].shoppingCart, companyType);

      return res.status(200).send({
        order: responseOrder[0],
        cart: cart,
      });
    }

    return res.status(200).send({});
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Front/v1/Order/ListOneController.js',
      error: err?.message,
      method: 'ListOneController',
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
      message: "Fail List One",
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

  if (companyType === "restaurant" || companyType === "accessories") {
    const path = companyType === "restaurant" ? "foodProduct" : "accessoriesProduct";

    cartItens = await CartItem.find({
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
          path: "category",
          select: { _id: 0, name: 1 },
        },
      })
      .select({
        size: 1,
        pieces: 1,
        flavors: 1,
        isPizza: 1,
        size: 1,
        pieces: 1,
        flavors: 1,
        isPizza: 1,
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
    cartItens = await CartItem.find({
      shoppingCart: cartId,
      isDeleted: false,
    })
      .populate({
        path: "product",
        select: {
          images: 1,
          name: 1,
          barcode: 1,
          description: 1,
          price: 1,
          pricePromotion: 1,
        },
      })
      .select({
        isPizza: 1,
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
    if (item && item.product && item.product._id && (!item.product.deletedAt || item.product.deletedAt === false)) {
      return item;
    } else if (item && item.foodProduct && item.foodProduct._id && (!item.foodProduct.deletedAt || item.foodProduct.deletedAt === false)) {
      return item;
    } else if (
      item &&
      item.accessoriesProduct &&
      item.accessoriesProduct._id &&
      (!item.accessoriesProduct.deletedAt || item.accessoriesProduct.deletedAt === false)
    ) {
      return item;
    }
  });

  for await (let cartItem of cartItens) {
    if (companyType === "accessories") {
      checks = await getComplementsAccessoriesCheck(cartItem);
      radio = await getComplementsAccessoriesRadio(cartItem);
    } else {
      checks = await getComplementsCheck(cartItem);
      radio = await getComplementsRadio(cartItem);
    }

    cartItem.complements = [...checks, ...radio];
  }

  return cartItens;
};

const getComplementsRadio = async item => {
  try {
    let radios = item.radio;
    let complements = [];

    if (!radios || radios.length <= 0) {
      return [];
    }

    for await (radio of radios) {
      let result = {};
      if (!item.isPizza) {
        result = await ProductComplementItem.findById(radio.id)
          .populate("foodProductComplement", {
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
      } else {
        result._id = "";
        result.codPdv = "";
        result.description = "";
        result.foodProductComplement = { name: radio.group === "edges" ? "Borda" : "Massa" };
        result.name = radio.id;
        result.price = 0;
      }

      if (radio && radio.price >= 0) {
        result.price = radio.price;
      }

      if (radio && radio.quantity > 0) {
        result.amount = radio.quantity;
      }

      complements.push(result);
    }

    return complements;
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getComplementsAccessoriesRadio = async item => {
  try {
    let radios = item.radio;
    let complements = [];

    if (!radios || radios.length <= 0) {
      return [];
    }

    for await (radio of radios) {
      let item = await AccessoriesComplementItem.findById(radio.id)
        .populate("accessoriesProductComplement", {
          _id: 0,
          name: -1,
          category: -1,
        })
        .select({
          codPdv: 1,
          description: 1,
          accessoriesProductComplement: 1,
          name: 1,
          price: 1,
        })
        .lean();

      if (radio && radio.price >= 0) {
        item.price = radio.price;
      }

      if (radio && radio.quantity >= 0) {
        result.amount = radio.quantity;
      }

      complements.push(item);
    }

    return complements;
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getComplementsCheck = async item => {
  try {
    let checks = item.check;
    let complements = [];

    if (!checks || checks.length <= 0) {
      return [];
    }

    for await (check of checks) {
      let result = {};
      if (!item.isPizza) {
        result = await ProductComplementItem.findById(check.id)
          .populate("foodProductComplement", {
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
      } else {
        const product = await ProductModel.findById(check.id).lean();

        result._id = product._id;
        result.codPdv = product.codPdv;
        result.description = "";
        result.foodProductComplement = { name: "Sabores" };
        result.name = product.name;
        result.price = 0;
        result.amount = item.flavors === 1 ? "1" : `${check.quantity}/${item.flavors}`;
      }

      if (check && check.price >= 0) {
        result.price = check.price;
      }

      if (check && check.quantity >= 0) {
        result.amount = check.quantity;
      }

      complements.push(result);
    }

    return complements;
  } catch (err) {
    console.log("err", err);
    return [];
  }
};
const getComplementsAccessoriesCheck = async item => {
  try {
    let checks = item.check;
    let complements = [];

    if (!checks || checks.length <= 0) {
      return [];
    }

    for await (check of checks) {
      if (typeof check.quantity !== "undefined") {
        if (check.quantity > 0) {
          let item = await AccessoriesComplementItem.findById(check.id)
            .populate("accessoriesProductComplement", {
              _id: 0,
              name: -1,
              category: -1,
            })
            .select({
              codPdv: 1,
              description: 1,
              accessoriesProductComplement: 1,
              name: 1,
              price: 1,
            })
            .lean();

          if (check && check.price >= 0) {
            item.price = check.price;
          }

          if (check && check.quantity >= 0) {
            result.amount = check.quantity;
          }

          complements.push(item);
        }
      } else {
        let item = await AccessoriesComplementItem.findById(check.id)
          .populate("accessoriesProductComplement", {
            _id: 0,
            name: -1,
            category: -1,
          })
          .select({
            codPdv: 1,
            description: 1,
            accessoriesProductComplement: 1,
            name: 1,
            price: 1,
          })
          .lean();

        if (check && check.price >= 0) {
          item.price = check.price;
        }

        if (check && check.quantity >= 0) {
          result.amount = check.amount;
        }

        complements.push(item);
      }
    }

    return complements;
  } catch (err) {
    return [];
  }
};

module.exports = one;
