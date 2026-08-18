const mongoose = require('mongoose');
const Controller = require('../../../models/Setting/ControllerModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
    try {

        const  data  = req.body;
        data._id = new mongoose.Types.ObjectId().toHexString();

        // Trata status
        data.status = (
            ((typeof data.status === 'string') && data.status === "")
            || (data.status === null)
        ) ? false : data.status;

        let controller = await Controller.create(data);
        controller = await controller.populate('module', {name: 1}).execPopulate();

        return res.send({
            status: 200,
            message: "Registro cadastrado com sucesso",
            data: controller
        });
    } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Setting/Controller/CreateController.js',
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
            message: "Falha ao cadastrar Registro",
            error: dadosDoErro
        });
    }
};
