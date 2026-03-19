/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../models/LogModel");

const listController = async (request, reply) => {
  try {
    const { booking = null } = request.query;

    const response = await BookingModel.findById(booking)
      .populate("driver")
      .populate({
        path: "payment",
        select: {
          total: 1,
          typePayment: 1,
          debitPriceAdm: 1,
          debitPriceFranchise: 1,
          priceDiscountVoucher: 1,
        },
      })
      .populate({
        path: "service",
        select: {
          name: 1,
          minimumRate: 1,
          basePrice: 1,
          timePrice: 1,
          currencyPrice: 1,
        },
      })
      .populate({
        path: "passenger",
        populate: {
          path: "person",
        },
      })
      .lean();

    if (response && response.status) {
      switch (response.status) {
        case "waiting":
          response.statusTxt = "Aguardando";
          break;
        case "accepted":
          response.statusTxt = "Aceito";
          break;
        case "concluded":
          response.statusTxt = "Finalizado";
          break;
        case "canceled":
          response.statusTxt = "Cancelado";
          break;
        default:
          response.statusTxt = "";
      }
    }

    if (response && response.payment && response.payment.typePayment) {
      switch (response.payment.typePayment) {
        case "MONEY":
          response.payment.typePaymentTxt = "Dinheiro";
          break;
        case "CARD":
          response.payment.typePaymentTxt = "Debito";
          break;
        case "BRASPAG":
          response.payment.typePaymentTxt = "Crédito";
          break;
        case "PAGARME":
          response.payment.typePaymentTxt = "Crédito";
          break;
        case "PIX":
          response.payment.typePaymentTxt = "PIX";
          break;
      }
    }

    if (response && response.service && response.service.timePrice && response.routeTime) {
      response.costPerMinute = "";
      let routeTime = parseInt(response.routeTime);
      if (routeTime > 0) {
        response.costPerMinute = routeTime * response.service.timePrice;
      }
    }

    if (response && response.service && response.service.currencyPrice && response.distance) {
      response.costPerKM = "";
      let distance = parseFloat(response.distance);
      if (distance > 0) {
        response.costPerKM = distance * response.service.currencyPrice;
      }
    }

    if (response) {
      response.priceDriver = getPriceDriver(response);
      // response.pricePassenger = getPricePassenger(response);
      response.amountReceivable = getAmountReceivable(response);
    }

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/booking/ListController.js",
      error: err?.message,
      method: "listController",
      type: "error",
      level: 0,
      origin: "backend",
      request: {
        application: request?.application,
        franchise: request?.franchise,
        company: request?.company,
        params: request?.params,
        body: request?.body,
        query: request?.query,
        heders: request?.heders,
        method: request?.method,
        url: request?.url,
      },
    });

    return reply.status(400).send({
      message: "Não foi possível listar corrida",
      err: err.message,
    });
  }
};

const getPriceDriver = response => {
  let priceDriver = 0;
  let diff = 0;

  if (response) {
    priceDriver = Number(response.price);
  }

  if (response && response.payment && response.payment.debitPriceAdm > 0) {
    diff += Number(response.payment.debitPriceAdm);
  }

  if (response && response.payment && response.payment.debitPriceFranchise > 0) {
    diff += Number(response.payment.debitPriceFranchise);
  }

  return Number((priceDriver - diff).toFixed(2));
};

const getPricePassenger = response => {
  try {
    let pricePassenger = Number(response.price);

    if (response?.payment.priceDiscountVoucher) {
      pricePassenger -= Number(response?.payment.priceDiscountVoucher);
    }

    return Number(pricePassenger).toFixed(2);
  } catch (err) {
    return response?.price;
  }
};

const getAmountReceivable = response => {
  let diff = 0;

  if (response && response.payment && response.payment.debitPriceAdm > 0) {
    diff += Number(response.payment.debitPriceAdm);
  }

  if (response && response.payment && response.payment.debitPriceFranchise > 0) {
    diff += Number(response.payment.debitPriceFranchise);
  }

  return Number(diff.toFixed(2));
};

module.exports = listController;
