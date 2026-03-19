/** Lib */
const mongoose = require('mongoose');

/** Service */
const ProductImageApi = require('../../../services/ProductImageApi');

const LogModel = require("../../../models/LogModel");

const syncImage = async (req, res) => {
  try {

    const { company } = req.params;

    if (!company || !mongoose.isValidObjectId(company)) {
      return res.status(400).send({
        message: 'Informe uma empresa válida'
      });
    }

    let { data: responseToken } = await ProductImageApi.post('/v1/token', {
      appToken: 'aKyGycx0jU9ckrRJnotTbGUchgixO3A7o+34fHLJ3a2plKhWp50TUeIVMRNuBnCywWO2pYxhCzIRyqTm5TwSBdox+BZGAGxdHjSMA70LxpcPH93105Gt+EXCxLdsM9prKUQCSMypYk/819RxilLZTlZnJJQV2xEk',
      appSecret: 'uwIKdCVk4E3Jl8JuIvkcZ3jdB5QpXHPWVzPnwra0cZfsKk3WhARWbChlvQCQgwIVRabcfEW3YVdIcqMCm+GLOxw6hcwFo7rfC5n6ZmP/ORuVOghsd827IRpLqO+WBG5z6yqLYYCvYwi8DlRecsF3V3Ke8yFKewh8'
    });

    const { data: response } = await ProductImageApi.post('/v1/foodProduct/image', {
      company,
    }, {
      headers: {
        'Authorization': `Bearer ${responseToken.token}`
      }
    });

    if (!response) {
      return res.status(400).send({
        message: 'Falhou ao sincronizar'
      });
    }

    return res.status(200).send({
      message: 'Sincronização Realizada com sucesso!!'
    });

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Tools/Integrations/SyncImageController.js',
      error: err?.message,
      method: 'syncImage',
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
      message: 'Não foi possível sincronizar imagem',
      err: err.message,
    });
  }
};

module.exports = syncImage;
