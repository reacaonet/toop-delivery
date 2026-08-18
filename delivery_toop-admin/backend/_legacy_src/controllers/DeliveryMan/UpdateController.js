const moment = require("moment");
const DeliveryMan = require("../../models/DeliveryMan/DeliveryManModel");
const DeliveryFreeModel = require("../../models/DeliveryMan/util/DeliveryFee");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const { status, isOnline, showFreightValue } = req.body;

    if (status) {
      data.status = `${data.status}`;
      if (data.status === "true" || data.status === "false") {
        data.status = JSON.parse(`${data.status}`);
      } else {
        data.status = undefined;
      }
    }

    // não obrigatorio passar isOnline - caso não informado não setar como nulo, como estava a regra anterior
    if (isOnline) {
      data.isOnline = `${data.isOnline}`;
      if (data.isOnline === "true" || data.isOnline === "false") {
        data.isOnline = JSON.parse(`${data.isOnline}`);
      } else {
        delete data.isOnline;
      }
    }

    if (showFreightValue) {
      data.showFreightValue = `${data.showFreightValue}`;
      if (data.showFreightValue === "true" || data.showFreightValue === "false") {
        data.showFreightValue = JSON.parse(`${data.showFreightValue}`);
      } else {
        delete data.showFreightValue;
      }
    }

    if (data.longitude && data.latitude) {
      data.location = {
        type: "Point",
        coordinates: [data.longitude, data.latitude],
      };
      data.updatedLastLocation = moment().toDate();
    }

    if (data.companyService && Array.isArray(data.companyService) && data.companyService.length === 0) {
      delete data.companyService;

      await DeliveryMan.updateOne(
        { _id: id },
        {
          $unset: {
            companyService: 1,
          },
        },
      );
    }

    const novoRegistro = await DeliveryMan.findOneAndUpdate({ _id: id }, data, {
      upsert: true,
      new: true,
    })
      .populate("person")
      .populate("company");

    // if (data.deliveryFee && Array.isArray(data.deliveryFee)) {
    //   await DeliveryFreeModel.updateOne({
    //     deliveryFee: id
    //   }, {
    //     $set: {
    //       deliveryFee: data.company
    //     }
    //   }, {
    //     upsert: false,
    //   })
    // }

    res.send({
      status: 200,
      message: "DeliveryMan atualizado com sucesso",
      data: novoRegistro,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/UpdateController.js',
      error: err?.message,
      method: 'UpdateController',
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

    console.log("falhou", err);

    return res.status(400).send({
      message: "Falha ao atualizar deliveryMan",
      err: err,
    });
  }
};
