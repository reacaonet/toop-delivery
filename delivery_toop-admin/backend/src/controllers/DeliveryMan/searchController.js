const moment = require("moment");
const DeliveryMan = require("../../models/DeliveryMan/DeliveryManModel");

const TypeOfVehicle = require("../../models/utils/typeOfVehicle");
const LogModel = require('../../models/LogModel');

const maxDistance = 8000;
const waitingTime = 32;

const search = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).send({
        message: "Filtro é obrigatório",
      });
    }
    const deliveryMan = await DeliveryMan.find({
      // company: list,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: maxDistance,
        },
      },
      deletedAt: {
        $exists: false,
      },
      status: true,
    }).lean();

    return res.json(deliveryMan);
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/searchController.js',
      error: dadosDoErro?.message,
      method: 'search',
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


    console.log(dadosDoErro);
    return res.status(400).send({
      mesage: "Falha ao encontrar Cadastro de Entregas",
      error: dadosDoErro,
    });
  }
};

/** Utilizado na Cron MicroServiço Delivery-man */
const searchOne = async (req, res) => {
  try {
    const { lat, lng, DeliveryDifferent, sendToDeliveryMan, typeVehicle, sendToListDeliveryMan } = req.body;
    let filter = {};

    if (!lat || !lng) {
      return res.status(400).send({
        message: "Filtro é obrigatório",
      });
    }

    filter.status = true;
    filter.isOnline = true;
    filter.flag = {
      $nin: ["AVAILABLE", "ON_ROUTE", "UNAVAILABLE"],
    };

    filter.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)],
        },
        $maxDistance: maxDistance,
      },
    };

    if (sendToDeliveryMan) {
      filter._id = sendToDeliveryMan;
    } else if (sendToListDeliveryMan && Array.isArray(sendToListDeliveryMan) && sendToListDeliveryMan.length > 0) {
      filter._id = {
        $in: sendToListDeliveryMan,
      };
    } else {
      if (DeliveryDifferent && typeof DeliveryDifferent === "object" && DeliveryDifferent.length > 0) {
        filter._id = {
          $nin: DeliveryDifferent,
        };
      }

      // filter.companyService = {
      //   $exists: false,
      // };
    }

    filter.$or = [
      {
        lastQueue: {
          $lt: moment.utc().subtract(waitingTime, "seconds").toDate(),
        },
      },
      { lastQueue: { $exists: false } },
    ];

    // if (typeVehicle && TypeOfVehicle.includes(typeVehicle)) {
    //   filter.typeOfVehicle = typeVehicle;
    // }

    filter.deletedAt = {
      $exists: false,
    };

    // console.log('Filter Current', filter);
    const deliveryMan = await DeliveryMan.findOne(filter)
      .sort({
        updatedLastLocation: -1,
        updatedAt: -1,
      })
      .lean();

    if (deliveryMan && deliveryMan._id) {
      await DeliveryMan.updateOne(
        { _id: deliveryMan._id },
        {
          lastQueue: moment.utc().toDate(),
        },
      );
    }

    return res.status(200).send(deliveryMan);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/searchController.js',
      error: err?.message,
      method: 'searchOne',
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

    console.log("Error Geral", err);
    return res.status(400).send({
      message: "Falha ao listar um DeliveryMan",
      err: err.mesage,
    });
  }
};

module.exports = { search, searchOne };
