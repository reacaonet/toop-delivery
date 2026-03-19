const mongoose = require("mongoose");
const RaceHistory = require("../../../models/DeliveryMan/raceHistoryModel");
const OrderStatus = require("../../../models/Shopping/order/orderStatusModel");
const LogModel = require("../../../models/LogModel");
const distanceKM = require("../../../utils/distanceCoordinate");

const createHistory = async (req, res) => {
  try {
    const { deliveryMan, order, statusRace, latitude, longitude } = req.body;
    let data = {};

    if (!deliveryMan || !mongoose.isValidObjectId(deliveryMan)) {
      return res.status(400).send({
        message: "delivery-man invalid",
      });
    }

    if (!order || !mongoose.isValidObjectId(order)) {
      return res.status(400).send({
        message: "order invalid",
      });
    }

    if (!statusRace) {
      return res.status(400).send({
        message: "order invalid",
      });
    }

    let response = await OrderStatus.findById(order)
      .populate("company", {
        name: 1,
        location: 1,
        address: 1,
      })
      .populate("payment", {
        priceDelivery: 1,
      })
      .populate("customerDelivery", {
        location: 1,
      })
      .lean();

    if (!response || !response._id) {
      return res.status(400).send({
        message: "order invalid",
      });
    }

    console.log(response);

    data = {
      deliveryMan,
      order,
      company: response.company._id,
      companyName: response.company.name,
      companyAddress: response.company.address,
      payment: response.payment[0]._id
        ? response.payment[0]._id
        : response.payment._id,
      paymentPriceDelivery: response.payment.priceDelivery,
      statusRace,
    };

    console.log(data);

    const locationCompany = response.company.location;
    const locationUser = response.customerDelivery.location;

    if (latitude && longitude) {
      const distanceToCompany = distanceKM(
        {
          latitude: latitude,
          longitude: longitude,
        },
        {
          latitude: locationCompany.coordinates[1],
          longitude: locationCompany.coordinates[0],
        }
      );

      const distanceToUser = distanceKM(
        {
          latitude: locationUser.coordinates[1],
          longitude: locationUser.coordinates[0],
        },
        {
          latitude: locationCompany.coordinates[1],
          longitude: locationCompany.coordinates[0],
        }
      );

      const distanceTotal = distanceToCompany + distanceToUser;
      data.distanceToCompany = distanceToCompany;
      data.distanceTotal = distanceTotal;
    }

    let newHistory = await RaceHistory.create(data);
    return res.status(200).send(newHistory);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/raceHistory/CreateController.js',
      error: err?.message,
      method: 'createHistory',
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
      message: "Fail create history",
      err: err.message,
    });
  }
};

module.exports = createHistory;
