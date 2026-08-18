const moment = require('moment');
const mongoose = require('mongoose');
const DeliveryMan = require('../../models/DeliveryMan/DeliveryManModel');
const LogModel = require("../../models/LogModel");

const updateLocation = async (req, res) => {
  try {
    let data = req.body;
    const id = req.params.id;

    if (data && data.length > 0) {
      data = data[0];
    }

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        message: 'Informe um entregador válido'
      });
    }


    if (!data.longitude || !data.latitude) {
      return res.status(400).send({
        message: 'Informe uma coordenada'
      });
    }

    if (data.longitude && data.latitude) {
      data.location = {
        type: 'Point',
        coordinates: [data.longitude, data.latitude]
      };
      data.updatedLastLocation = moment().toDate();
    }

    await DeliveryMan.updateOne({ _id: id }, data);

    return res.send({
      status: 200,
      message: "DeliveryMan atualizado com sucesso",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/updateLocation.js',
      error: err?.message,
      method: 'updateLocation',
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
      err: err.message,
      message: 'Não foi possível atualizar status',
    });
  }
};

module.exports = updateLocation;
