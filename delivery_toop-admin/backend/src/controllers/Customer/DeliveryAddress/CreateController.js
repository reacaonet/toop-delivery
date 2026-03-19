const mongoose = require("mongoose");
const axios = require("axios");
// const axios = require("axios").default || require("axios");

/** Model */
const DeliveryAddress = require("../../../models/Customer/DeliveryAddressModel");
const LogModel = require('../../../models/LogModel');

// Atualiza status main dos endereços vinculados ao usuário
const updateMainCustomerAddress = async (deliveryAddressId, customerId, req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updateCustomerAddress = await DeliveryAddress.updateMany(
        {
          customer: customerId,
          _id: {
            $ne: deliveryAddressId,
          },
        },
        {
          $set: {
            main: false,
          },
        },
      );

      resolve(updateCustomerAddress);
    } catch (error) {
  await LogModel.create({
    path: 'src/controllers/Customer/DeliveryAddress/CreateController.js',
    error: error?.message,
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


      return reject(error);
    }
  });
};

const newTopic = async (topic, customer, req) => {
  try {
    const { data: newTopic } = await axios.post(`${process.env.HOST}:${process.env.PORT}/v2/notification-topic`, {
      topic,
      slug: "city",
    });

    if (!newTopic || !newTopic._id) {
      return;
    }

    const { data: customerTopics } = await axios.post(`${process.env.HOST}:${process.env.PORT}/v2/notification-topic/customer`, {
      customer,
      topic: newTopic._id,
    });
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Customer/DeliveryAddress/CreateController.js',
    error: err?.message,
    method: 'newTopic',
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

    return false;
  }
};

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    if (!data.longitude || !data.latitude) {
      return res.status(400).send({
        message: "Campos 'latitude' e 'longitude' são obrigatórios",
      });
    }

    data.location = {
      type: "Point",
      coordinates: [Number(data.longitude), Number(data.latitude)],
    };

    // Seta o endereço atual como principal
    data.main = true;
    const deliveryAddress = await DeliveryAddress.create(data);

    if (deliveryAddress && deliveryAddress._id) {
      // Seta main=false em outros endereços vinculados ao usuário
      await updateMainCustomerAddress(deliveryAddress._id, data.customer);
    } else {
      return res.status(400).send({
        message: "Erro ao criar o endereço de entrega",
        data: novoRegistro,
      });
    }

    // Adicionar novo Topico ao customer
    if (data.city) {
      newTopic(data.city, data.customer);
    }

    return res.send({
      status: 200,
      message: "Endereço de entrega criado com sucesso",
      data: deliveryAddress,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Customer/DeliveryAddress/CreateController.js',
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
      message: "Falha ao registrar Endereço de Entrega",
      Error: dadosDoErro.message,
    });
  }
};
