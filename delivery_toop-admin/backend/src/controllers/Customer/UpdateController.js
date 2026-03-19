const axios = require("axios");

/** Model */
const Customer = require("../../models/CustomerModel");
const PassengerModel = require("../../models/Mobility/Passenger/PassengerModel");
const getRandom = require("./utils/getRandom");
const CustomerTopic = require("../../models/Notification/CustomerTopic");
const LogModel = require('../../models/LogModel');
const { removeUserFromTopic } = require("../Mobility/Topic/LinkController");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (data.ddi) {
      data.ddi = decodeURIComponent(data.ddi);
    }

    let customerBefore = await Customer.findById(id)
      .select({
        instanceIdToken: 1,
      })
      .lean();

    //   const novoRegistro = await Customer.findOneAndUpdate({ _id: id }, data, { upsert: true, new: true }).populate('groups');
    const novoRegistro = await Customer.findOneAndUpdate({ _id: id }, data, {
      upsert: true,
      new: true,
    });

    // Update Token Passenger
    const passengerToken = await PassengerModel.findOneAndUpdate({ person: novoRegistro.person }, {
      $set: {
        token: novoRegistro.token
      }
    }, {
      upsert: false,
      new: false,
    });

    if (passengerToken?.token !== novoRegistro?.token) {
      await removeUserFromTopic({ ...passengerToken.toObject(), token: novoRegistro.token }, 'passenger', PassengerModel, null);
    }

    let customer;

    if (!novoRegistro.sku) {
      let sku = await uniqueSku();
      if (sku) {
        await Customer.updateOne({ _id: id }, { sku }); // Adicionar um novo
      }
    }

    if (novoRegistro && novoRegistro._id) {
      customer = await Customer.findById(novoRegistro._id).populate("person").lean();
    }

    if (customerBefore && customerBefore.instanceIdToken && data && data.instanceIdToken) {
      userTopics(data.instanceIdToken, customerBefore);
    }

    res.send({
      status: 200,
      message: "Sucesso ao Atualizar Cliente",
      data: customer,
    });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/Customer/UpdateController.js',
      error: dadosDoErro?.message,
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


    return res.status(400).send({
      message: "Falha ao Atualizar Customer",
      Error: dadosDoErro,
    });
  }
};

const uniqueSku = async () => {
  try {
    let sku = getRandom(18);
    let response = await Customer.findOne({ sku }).lean();

    if (!response || !response.sku) {
      return sku;
    }

    return await isUnique();
  } catch (err) {
    return "";
  }
};

// Se a InstanceId modificar cadastrar os topicos antigo para este usuário
// um token é renovado geralmente quando é desinstalado o app
const userTopics = async (instanceIdToken, customer) => {
  try {
    if (`${instanceIdToken}` === `${customer.instanceIdToken}`) {
      return;
    }

    let customerTopic = await CustomerTopic.findOne({ customer: customer._id })
      .select({
        topics: 1,
        customer: 1,
      })
      .lean();

    if (!customerTopic.topics || typeof customerTopic.topics !== "object" || !customerTopic.topics.length < 0) {
      return;
    }

    let topic = customerTopic.topics[0];
    const { data: response } = await axios.post(`${process.env.HOST}:${process.env.PORT}/v2/notification-topic/customer`, {
      customer: customer._id,
      topic: topic,
    });
    return;
  } catch (err) {
    return false;
  }
};
