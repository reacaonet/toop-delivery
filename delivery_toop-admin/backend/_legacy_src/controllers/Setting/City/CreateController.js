const mongoose = require('mongoose');
const City = require('../../../models/Setting/CityModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
    try {

        const  data  = req.body;
        data._id = new mongoose.Types.ObjectId().toHexString();

        let city = await City.create(data);
        city = await city.populate('state').execPopulate();

        return res.send({
            status: 200,
            message: "Cidade cadastrado com sucesso",
            data: city
        });
    } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Setting/City/CreateController.js',
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
            message: "Falha ao cadastrar cidade",
            error: dadosDoErro
        });
    }
};
