const mongoose = require('mongoose');
const State = require('../../../models/Setting/StateModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
    try {
        const  data  = req.body;
        data._id = new mongoose.Types.ObjectId().toHexString();

        let state = await State.create(data);
        console.log(data);
        
        return res.send({
            status: 200,
            message: "Estado cadastrado com sucesso",
            data: state
        });
    } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Setting/State/CreateController.js',
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
            message: "Falha ao cadastrar Estado",
            error: dadosDoErro
        });
    }
};
