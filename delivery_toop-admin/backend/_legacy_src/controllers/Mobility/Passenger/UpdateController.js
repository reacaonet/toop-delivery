const mongoose = require("mongoose");
const PassengerModel = require("../../../models/Mobility/Passenger/PassengerModel");
const PersonModel = require("../../../models/Person/PersonModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (`${data.status}` === "true" || `${data.status}` === "false") {
      data.status = `${data.status}` === "true" ? true : false;
    } else {
      delete data.status;
    }

    const registerUpdate = await PassengerModel.findOneAndUpdate({ _id: id }, data, {
      upsert: true,
      new: true,
    });

    if (data?.person?._id) {
      await PersonModel.updateOne({ _id: data?.person?._id }, data?.person);
    }

    res.send({
      status: 200,
      message: "Registro atualizado com sucesso",
      data: registerUpdate,
    });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: "src/controllers/Mobility/Passenger/UpdateController.js",
      error: dadosDoErro?.message,
      method: "UpdateController",
      type: "error",
      level: 0,
      origin: "backend",
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

    return res.status(400).send({
      message: "Falha ao Atualizar Registro",
      Error: dadosDoErro,
    });
  }
};
