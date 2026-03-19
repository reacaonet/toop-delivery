const mongoose = require("mongoose");

const GlobalSetting = require("../../../models/GlobalSettingsModel");
const CompanyDelivery = require("../../../models/Company/CompanyDeliveryModel");
const CustomerDelivery = require("../../../models/Customer/DeliveryAddressModel");
const Cart = require("../../../models/Shopping/CartModel");
const CartItem = require("../../../models/Shopping/CartItemModel");
const distanceKM = require("../../../utils/distanceCoordinate");
const LogModel = require("../../../models/LogModel");

const total = async (company, delivery, cartItens) => {
  try {
    let settings = await GlobalSetting.findOne({});
    let location = delivery.location.coordinates;
    let latitude = location[1];
    let longitude = location[0];

    let total = 0;
    let totalCompany = 0;
    let serviceCharge = 0;
    let priceDelivery = 0;

    let subTotal = cartItens.reduce((totalPrice, product) => {
      let price = product.pricePromotion && product.pricePromotion !== null ? product.pricePromotion : product.price;
      return totalPrice + price * product.amount;
    }, 0);

    total += subTotal;

    if (settings.serviceCharge && settings.serviceCharge > 0) {
      let taxa = settings.serviceCharge / 100;
      serviceCharge = total * taxa;
      total += serviceCharge;
    }

    // Taxa de entrega company
    const companyDelivery = await CompanyDelivery.findOne({ company }).populate("company").lean();
    if (companyDelivery && companyDelivery.distance) {
      let distance = companyDelivery.distance;
      let locationCompany = companyDelivery.company.location.coordinates;

      const distanceUser = distanceKM(
        {
          latitude: latitude,
          longitude: longitude,
        },
        {
          latitude: locationCompany[1],
          longitude: locationCompany[0],
        },
      );

      distance.forEach(element => {
        const min = element.min / 1000;
        const max = element.max / 1000;

        if (distanceUser >= min && distanceUser <= max) {
          priceDelivery = element.price;
          return;
        }
      });
    }

    total += priceDelivery;
    totalCompany = total - serviceCharge;
    total = total.toFixed(2) * 100;
    totalCompany = totalCompany.toFixed(2) * 100;
    total = total;

    return {
      serviceCharge: serviceCharge,
      priceDelivery,
      totalCompany,
      total: total,
    };
  } catch (err) {
    console.log(err);
    return false;
  }
};

const priceCart = async (cart, company, delivery) => {
  try {
    let filter = {};
    let product = {};

    filter.shoppingCart = mongoose.Types.ObjectId(cart);
    filter.type = company.shoppingFlow === "MENU" ? "restaurant" : "supermarket";

    if (company.shoppingFlow === "MENU") {
      product = {
        from: "foodProduct",
        localField: "foodProduct",
        foreignField: "_id",
        as: "product",
      };
    } else if (company.type === "accessories") {
      product = {
        from: "accessoriesProduct",
        localField: "accessoriesProduct",
        foreignField: "_id",
        as: "product",
      };
    } else {
      product = {
        from: "product",
        localField: "product",
        foreignField: "_id",
        as: "product",
      };
    }

    let itens = await CartItem.aggregate([
      { $match: filter },
      { $lookup: product },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          cartItemId: "$_id",
          amount: 1,
          check: 1,
          radio: 1,
          cartId: "$shoppingCart",
          price: 1,
          pricePromotion: 1,
          product: 1,
          isDeleted: 1,
        },
      },
    ]);

    itens = itens.filter(item => {
      // produto tem que existir e item no carrinho não deletado
      if (item && item.product && item.product._id && item.isDeleted === false && (!item.product.deletedAt || item.product.deletedAt === false)) {
        return item;
      }
    });

    let totalItens = itens.length;
    const companyType = company.shoppingFlow === "MENU" ? "restaurant" : "supermarket";

    let subTotal = Number(priceSubTotal(itens, companyType, true)).toFixed(2) * 1;

    let subTotalNormal = Number(priceSubTotal(itens, companyType, false)).toFixed(2) * 1;
    let serviceCharge = await calcServiceCharge(subTotal, company);
    serviceCharge = Number(serviceCharge).toFixed(2) * 1;
    let deliveryFee = 0;

    if (delivery) {
      deliveryFee = await calcDeliveryFee(cart);
    }

    deliveryFee = Number(deliveryFee).toFixed(2) * 1;

    const shippingInfo = await getFreeShippingBonus(cart, deliveryFee, subTotal);

    return {
      totalItens,
      subTotal,
      subTotalNormal,
      serviceCharge,
      deliveryFee,
      cart: itens,
      shippingInfo,
    };
  } catch (err) {
    return false;
  }
};

const priceSubTotal = (itens, type, promotion = false) => {
  try {
    if (type === "supermarket") {
      return itens.reduce((total, product) => {
        let price = 0;

        if (promotion && product.pricePromotion) {
          price = product.pricePromotion;
        } else {
          price = product.price;
        }

        return total + price * product.amount;
      }, 0);
    } else if (type === "restaurant" || type === "accessories") {
      return itens.reduce((total, product) => {
        let calcTotal = 0;

        if (product.check) {
          product.check.map(c => {
            calcTotal = calcTotal + c.price;
          });
        }

        if (product.radio) {
          product.radio.map(r => {
            calcTotal = calcTotal + r.price;
          });
        }

        if (`${calcTotal}` == "NaN") {
          calcTotal = 0;
        }

        if (promotion && product.pricePromotion) {
          calcTotal = (calcTotal + product.pricePromotion) * product.amount;
        } else {
          calcTotal = (calcTotal + product.price) * product.amount;
        }

        total += calcTotal;
        return total;
      }, 0);
    }

    return "";
  } catch (err) {
    return "";
  }
};

const calcServiceCharge = async (subTotal, company) => {
  try {
    if (company && company.shoppingFlow === "MENU") {
      return 0;
    }

    let taxa = 0.06;
    let settings = await GlobalSetting.findOne({});

    if (settings.serviceCharge && settings.serviceCharge > 0) {
      taxa = settings.serviceCharge / 100;
    }

    return subTotal * taxa;
  } catch (err) {
    console.log("Error", err);
    return 0;
  }
};

const calcDeliveryFee = async cart => {
  try {
    let price = 0;

    let shopCart = await Cart.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(cart),
        },
      },
      {
        $lookup: {
          from: "company_delivery",
          as: "companyDelivery",
          let: { companyId: "$company" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$company", "$$companyId"] },
                deletedAt: {
                  $exists: false,
                },
              },
            },
            { $project: { mdr: 1, fee: 1, distance: 1 } },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $lookup: {
          from: "company",
          as: "company",
          let: { companyId: "$company" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$companyId"] },
              },
            },
            { $project: { location: 1 } },
            {
              $limit: 1,
            },
          ],
        },
      },
      { $project: { customer: 1, company: 1, companyDelivery: 1 } },
      { $limit: 1 },
    ]);

    if (!shopCart || !shopCart[0].companyDelivery || !shopCart[0].companyDelivery[0]) {
      return 0;
    }

    let companyDelivery = shopCart[0].companyDelivery[0];
    let customer = shopCart[0].customer;
    let customerDelivery = await CustomerDelivery.findOne({
      customer: customer,
      main: true,
      isDeleted: false,
    });

    if (!customerDelivery || !customerDelivery.location) {
      return 0;
    }

    let latitude = customerDelivery.location.coordinates[1];
    let longitude = customerDelivery.location.coordinates[0];
    let latitudeCompany = shopCart[0].company[0].location.coordinates[1];
    let longitudeCompany = shopCart[0].company[0].location.coordinates[0];

    const distanceUser = distanceKM(
      {
        latitude: latitude,
        longitude: longitude,
      },
      {
        latitude: latitudeCompany,
        longitude: longitudeCompany,
      },
    );

    let distances = companyDelivery.distance;
    distances.forEach(element => {
      const min = element.min / 1000;
      const max = element.max / 1000;
      if (distanceUser >= min && distanceUser <= max) {
        price = element.price;
        return;
      }
    });

    if (!price || price <= 0) {
      if (distances && Array.isArray(distances) && distances.length > 0) {
        let lastIndex = distances.length - 1;
        const item = distances[lastIndex];
        if (item.price) {
          price = item.price;
        }
      }
    }

    return price;
  } catch (err) {
    console.log("Error", err);
    return 0;
  }
};

const totalCart = payload => {
  try {
    let total = 0;
    let subTotal = Number(payload.subTotal);
    let serviceCharge = Number(payload.serviceCharge);
    let deliveryFee = 0;
    let freeShippingBonus = 0;

    if (payload.hasOwnProperty("deliveryFee") && payload.deliveryFee > 0) {
      deliveryFee = Number(payload.deliveryFee);
    }
    if (payload.hasOwnProperty("shippingInfo") && payload.shippingInfo && payload.shippingInfo.free > 0) {
      freeShippingBonus = Number(payload.shippingInfo.free);
    }

    total += subTotal + serviceCharge + deliveryFee - freeShippingBonus;
    return Number(total).toFixed(2) * 1;
  } catch (err) {
    return false;
  }
};

const getFreeShippingBonus = async (cart, deliveryFee, subTotal) => {
  try {
    let free = 0;
    let payload = {};

    let shopCart = await Cart.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(cart),
        },
      },
      {
        $lookup: {
          from: "company_delivery",
          as: "companyDelivery",
          let: { companyId: "$company" },
          pipeline: [
            {
              $match: {
                deletedAt: { $exists: false },
                $expr: { $eq: ["$company", "$$companyId"] },
              },
            },
            { $project: { shippingInfo: 1 } },
            {
              $limit: 1,
            },
          ],
        },
      },
      { $unwind: { path: "$companyDelivery" } },
      { $project: { customer: 1, companyDelivery: 1 } },
      { $limit: 1 },
    ]);

    shopCart = shopCart[0];
    if (!shopCart.companyDelivery.shippingInfo) {
      return { free: 0, origin: null, payload };
    }

    if (shopCart.companyDelivery.shippingInfo.freeShipping) {
      payload = shopCart.companyDelivery.shippingInfo;

      if (shopCart.companyDelivery.shippingInfo.freeShippingAbove === null || shopCart.companyDelivery.shippingInfo.freeShippingAbove === 0) {
        free = deliveryFee;
      } else if (subTotal > shopCart.companyDelivery.shippingInfo.freeShippingAbove) {
        free = deliveryFee;
      }

      return {
        free,
        origin: shopCart.companyDelivery.shippingInfo.activatedBy,
        payload,
      };
    } else {
      return { free: 0, origin: null, payload };
    }
  } catch (err) {
    console.log("Error", err);
    return { free: 0, origin: null, payload };
  }
};
module.exports = { total, priceCart, totalCart };
