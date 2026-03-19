const mongoose = require('mongoose');
const Shopper = require('../../models/ShopperModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    data.isOnline =
      (typeof data.isOnline === "string" && data.isOnline === "") ||
        data.isOnline === null
        ? false
        : data.isOnline;

    data.status = (
      ((typeof data.status === 'string') && data.status === "") ||
      (data.status === null)
    ) ? false : data.status;

    let shopper = await Shopper.create(data);
    shopper = await shopper.populate('company').populate('person').execPopulate();

    return res.send({
      status: 200,
      message: "Shopper criado com sucesso",
      data: shopper
    });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/Shopper/CreateController.js',
      error: dadosDoErro?.message,
      method: 'CreateController',
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
      message: "Falha ao criar Shopper",
      Error: dadosDoErro
    });
  }
};
