const mongoose = require("mongoose");

const moment = require("moment");
const Cart = require("../../../models/Shopping/CartModel");
const Tip = require("../../../models/TipModel");
const GlobalSetting = require("../../../models/GlobalSettingsModel");
const CartItem = require("../../../models/Shopping/CartItemModel");
const CustomerDelivery = require("../../../models/Customer/DeliveryAddressModel");
const CompanyDeliveryModel = require("../../../models/Company/CompanyDeliveryModel");
const distanceKM = require("../../../utils/distanceCoordinate");
const ProductComplementItemModel = require("../../../models/Food/ProductComplementItemModel");

const CashbackCustomerBalanceModel = require("../../../models/Cashback/CashbackCustomerBalanceModel");
const CampaignModel = require("../../../models/Cashback/CashbackCampaignModel");
const PaymentModel = require("../../../models/Shopping/PaymentModel");
const LogModel = require("../../../models/LogModel");

const cartUserCurrent = async (req, res) => {
  try {
    const { cart } = req.params;
    let { type, delivery, updateCard } = req.query;
    let filter = {};
    let product = {};

    if (!cart || !mongoose.isValidObjectId(cart)) {
      return res.status(400).send({ message: "Informe um carrinho válido" });
    }

    if (!type || (type !== "restaurant" && type !== "accessories")) {
      type = "supermarket";
    }

    filter.isDeleted = false;
    filter.shoppingCart = mongoose.Types.ObjectId(cart);
    filter.type = type;

    if (type === "restaurant" || type === "accessories") {
      const path = type === "restaurant" ? "foodProduct" : "accessoriesProduct";
      product = {
        from: path,
        localField: path,
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
          product: 1,
          cartId: "$shoppingCart",
          price: 1,
          pricePromotion: 1,
          product: 1,
          comment: 1,
          isPizza: 1,
          size: 1,
          pieces: 1,
          flavors: 1,
          billing_mode: 1,
        },
      },
    ]);

    itens = itens.filter(item => {
      if (item && item.product && item.product._id && (!item.product.deletedAt || item.product.deletedAt === false)) {
        return item;
      }
    });

    let newItens = [];

    for await (const item of itens) {
      const newRadios = [];
      if (item.radio) {
        for await (const itemRadio of item.radio) {
          if (!item.isPizza) {
            const radio = await ProductComplementItemModel.findOne({ _id: itemRadio.id });
            newRadios.push({ ...itemRadio, name: radio.name });
          } else {
            newRadios.push({ ...itemRadio });
          }
        }
      }

      newItens.push({ ...item, radio: newRadios });
    }

    itens = newItens;

    newItens = [];
    for await (const item of itens) {
      const newCheck = [];
      if (item.check) {
        for await (const itemCheck of item.check) {
          if (!item.isPizza) {
            const check = await ProductComplementItemModel.findOne({ _id: itemCheck.id });
            newCheck.push({ ...itemCheck, name: check.name });
          } else {
            newCheck.push({ ...itemCheck });
          }
        }
      }
      newItens.push({ ...item, check: newCheck });
    }
    itens = newItens;

    // Atualiza itens do carrinho - atualmente apenas supermercados
    if (updateCard && itens && itens.length > 0) {
      for await (const cardProd of itens) {
        if (type === "supermarket") {
          let price = cardProd.product.price;
          let pricePromotion = 0;

          if (cardProd.product && cardProd.product.pricePromotion) {
            pricePromotion = cardProd.product.pricePromotion;
          }

          let priceCard = cardProd.price;
          let pricePromotionCard = 0;

          if (cardProd.pricePromotion) {
            pricePromotionCard = cardProd.pricePromotion;
          }

          if (price != priceCard || pricePromotion != pricePromotionCard) {
            await CartItem.updateOne(
              { _id: cardProd._id },
              {
                price,
                pricePromotion,
              },
            );

            cardProd.price = price;
            cardProd.pricePromotion = pricePromotion;
          }
        }
      }
    }

    let totalItens = totalcartItens(itens);
    let subTotal = priceSubTotal(itens, type, true);

    let subTotalNormal = priceSubTotal(itens, type, false);
    let serviceCharge;

    // if (type !== "restaurant" && type !== "accessories") {
    //   serviceCharge = await calcServiceCharge(subTotal);
    // }

    let deliveryFee;
    let minPriceDeliveryFree;

    if (delivery) {
      const result = await calcDeliveryFee(cart);

      deliveryFee = result.price;
      minPriceDeliveryFree = result.minPriceDeliveryFree;
    }

    let valueTip = await priceTip(cart);

    let cartDetails = await Cart.findById(cart)
      .select({
        customer: 1,
        company: 1,
      })
      .lean();

    // obtem bonus no frete
    const shippingInfo = await getFreeShippingBonus(cart, cartDetails.company);

    // consulta para saber se tem cashback
    const cashbackBalance = await getCashbackBalance(cartDetails.customer);

    // consulta para ver se tem campanha de cashback disponivel
    const date = moment().startOf("day").utc(false).toDate();
    const campaing = await getCampaingCashback(cartDetails.company, date); // Campanha Ativa

    let availableCashback = 0;

    if (campaing && campaing._id && campaing.percent) {
      const percent = campaing.percent ? Number(campaing.percent) : 0;

      availableCashback = Number(Number(Number(subTotal) * (percent / 100)).toFixed(2));
    }

    return res.status(200).send({
      totalItens,
      subTotal,
      subTotalNormal,
      serviceCharge,
      deliveryFee,
      minPriceDeliveryFree,
      cart: itens,
      valueTip,
      cashbackBalance,
      availableCashback,
      shippingInfo,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/CartuserCurrent.js',
      error: err?.message,
      method: 'cartUserCurrent',
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

    console.log(err);
  }
};

const priceTip = async cart => {
  const result = await Cart.findById(cart).select({ tip: 1 }).lean();
  if (result && result.tip) {
    const tip = await Tip.findById(result.tip).select({ value: 1 }).lean();

    return tip.value;
  }

  return 0;
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

const calcServiceCharge = async subTotal => {
  try {
    let taxa = 0.06;
    let settings = await GlobalSetting.findOne({}).lean();

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
    let minPriceDeliveryFree = 0;

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
                deletedAt: { $exists: false },
              },
            },
            {
              $project: { mdr: 1, fee: 1, distance: 1 },
            },
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
    distances.some(element => {
      let min = Number(element.min / 1000);
      let max = Number(element.max / 1000);
      if (distanceUser >= min && distanceUser <= max) {
        price = element.price;
        if (element.minPriceDeliveryFree) {
          minPriceDeliveryFree = element.minPriceDeliveryFree;
        }

        return true;
      }
    });

    if (!price || price <= 0) {
      if (distances && Array.isArray(distances) && distances.length > 0) {
        let lastIndex = distances.length - 1;
        const item = distances[lastIndex];
        if (item.price) {
          price = item.price;
        }

        if (item.minPriceDeliveryFree) {
          minPriceDeliveryFree = item.minPriceDeliveryFree;
        }
      }
    }

    return { price, minPriceDeliveryFree };
  } catch (err) {
    console.log("Error", err);
    return 0;
  }
};

const totalcartItens = itens => {
  try {
    return itens.reduce((prev, next) => {
      return prev + next.amount;
    }, 0);
  } catch (err) {
    return "";
  }
};

const getFreeShippingBonus = async (cart, company) => {
  const payment = await PaymentModel.findOne({ shoppingCart: mongoose.Types.ObjectId(cart) });
  // console.log(payment);
  if (payment) {
    //obtem o bonus ja atribido ao pedido
    return {
      freeShippingBonus: payment.freeShippingBonus,
      freeShippingBonusOrigin: payment.freeShippingBonusOrigin,
      used: payment.freeShippingBonusOrigin ? true : false,
    };
  } else {
    const delivery = await CompanyDeliveryModel.findOne({
      deletedAt: {
        $exists: false,
      },
      company,
    });

    if (delivery) {
      return delivery.shippingInfo;
    } else {
      return {
        freeShipping: false,
        freeShippingAbove: 0,
        activatedBy: "",
      };
    }
  }
};

const getCashbackBalance = async customer => {
  try {
    const data = await CashbackCustomerBalanceModel.findOne({
      customer: customer,
    }).sort({ createdAt: -1 });

    if (data) {
      return data.cash;
    } else {
      return 0;
    }
  } catch (err) {
    return 0;
  }
};

const getCampaingCashback = async (company, date) => {
  try {
    let campaing = null;

    campaing = await CampaignModel.findOne({
      companies: company,
      status: true,
      endDate: {
        $gte: date,
      },
      startDate: {
        $lte: date,
      },
      deletedAt: {
        $exists: false,
      },
    }).lean();

    if (campaing && campaing._id) {
      return campaing;
    }

    campaing = await CampaignModel.findOne({
      status: true,
      allApp: true,
      endDate: {
        $gte: date,
      },
      startDate: {
        $lte: date,
      },
      deletedAt: {
        $exists: false,
      },
    }).lean();

    return campaing;
  } catch (err) {
    console.log("oops fail", err);
    return null;
  }
};

module.exports = { cartUserCurrent, priceSubTotal };
