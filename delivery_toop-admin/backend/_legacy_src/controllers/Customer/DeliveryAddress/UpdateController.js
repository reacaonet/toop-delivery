const DeliveryAddress = require("../../../models/Customer/DeliveryAddressModel");
const LogModel = require('../../../models/LogModel');
const axios = require("axios");

// Atualiza status main dos endereços vinculados ao usuário
const updateMainCustomerAddress = async (deliveryAddressId, customerId, req) => {
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

    return updateCustomerAddress;
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Customer/DeliveryAddress/UpdateController.js',
      error: err?.message,
      method: 'updateMainCustomerAddress',
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

const newTopic = async (topic, customer, req) => {
  try {
    const { data: newTopic } = await axios.post(`${process.env.HOST}:${process.env.PORT}/v2/notification-topic`, {
      topic,
      slug: "city",
    });

    if (!newTopic || !newTopic._id) {
      return false;
    }

    const { data: customerTopics } = await axios.post(`${process.env.HOST}:${process.env.PORT}/v2/notification-topic/customer`, {
      customer,
      topic: newTopic._id,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Customer/DeliveryAddress/UpdateController.js',
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
    const id = req.params.id;
    const data = req.body;

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

    const novoRegistro = await DeliveryAddress.findOneAndUpdate(
      {
        _id: id,
      },
      data,
      {
        upsert: true,
        new: true,
      },
    );

    // console.log('voltou', novoRegistro)
    if (novoRegistro && novoRegistro.customer) {
      // Seta main=false em outros endereços vinculados ao usuário
      await updateMainCustomerAddress(id, novoRegistro.customer, req);
    } else {
      return res.status(400).send({
        message: "Erro ao atualizar o endereço de entrega",
        data: novoRegistro,
      });
    }

    // Adicionar novo Topico ao customer
    if (data.city) {
      newTopic(data.city, data.customer, req);
    }

    res.send({
      status: 200,
      message: "Sucesso ao Atualizar Endereço de Entrega",
      data: novoRegistro,
    });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/Customer/DeliveryAddress/UpdateController.js',
      error: dadosDoErro?.message,
      method: 'updateMainCustomerAddress',
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
      message: "Falha ao Atualizar Endereço de Entrega",
      Error: dadosDoErro.message,
    });
  }
};
