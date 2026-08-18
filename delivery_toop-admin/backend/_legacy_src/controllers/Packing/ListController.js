const Packing = require('../../models/Packing/PackingModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {

    // const packing = req.params.packing;

    // let list = [];

    // if(packing === 'null'){
    //     list = await Packing.find()
    // } else {
    //     list = await Packing.find(
    //         {name: { $regex: '.*' + packing + '.*' } });
    // }

    const list = await Packing.find()

    return res.json(list)
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Packing/ListController.js',
    error: dadosDoErro?.message,
    method: 'ListController',
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
      mesage: "Falha ao encontrar Embalagem",
      error: dadosDoErro
    });
  }

  //     return res.json({lista: list})
  // } catch (dadosDoErro) {
  await LogModel.create({
    path: '',
    error: err?.message,
    method: '',
    type: 'error',
    level: 0,
    origin: 'backend',
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

  console.log(`Log de erro criado com sucesso.`);


  //     return res.status(400).send({
  //         mesage: "Falha ao encontrar Embalagem",
  //         error: dadosDoErro
  //     });
  // }

};
