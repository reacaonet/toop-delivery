const mongoose = require('mongoose');
const Customer = require('../../../../models/CustomerModel');
const Topic = require('../../../../models/Notification/TopicModel');
const CustomerTopic = require('../../../../models/Notification/CustomerTopic');
const notificationApi = require('../../../../services/notification');
const LogModel = require("../../../../models/LogModel");

/**
 * POST
 * /v2/notification-topic/customer
 * params
 *  - customer
 *  - topic
 */
const customerTopic = async (req, res) => {
  try {
    const { customer, topic } = req.body;
    let topics = [];

    if (!customer || !mongoose.isValidObjectId(customer)) {
      return res.status(400).send({
        message: 'Informe um customer',
      });
    }

    if (!topic || !mongoose.isValidObjectId(topic)) {
      return res.status(400).send({
        message: 'Informe um tópico válido',
      });
    }

    // Topic exist
    let topicResponse = await Topic.findById(topic).lean();

    if (!topicResponse) {
      return res.status(400).send({
        message: 'Topico não encontrado ou inválido',
      });
    }

    const response = await CustomerTopic.findOne({ customer }).lean();

    let customerResponse = await Customer
      .findById(customer)
      .select({ instanceIdToken: 1 })
      .lean();

    // Novo Cadastro Topico
    if (!response) {
      let newTopic = await CustomerTopic.create({
        customer,
        topics: [topicResponse._id],
      });

      await subscribe(topicResponse.topic, customerResponse);
      return res.status(200).send(newTopic);
    }

    // Atualizar lista de topicos
    topics = response.topics; // ids Topics
    let unsubTopics = [...topics];
    topics = await uniqueTopics(topics, topicResponse);


    let index = topics.findIndex(item => `${item}` === `${topic}`);
    if (index < 0) {
      topics.push(topic);
    }

    let update = await CustomerTopic.findOneAndUpdate(
      { _id: response._id },
      { topics },
      {
        upsert: true,
        new: true
      }
    );

    // Nomes para cadastro no Topicos
    let listSubscribe = await topicsName(topics);
    let listUnsubscribe = await topicsName(unsubTopics);

    await unsubscribe(customerResponse, listUnsubscribe);
    let respSub = await subscribe(listSubscribe, customerResponse);

    if (!respSub) {
      return res.status(400).send({
        message: 'Não foi possível vincular usuário ao topico',
      });
    }

    return res.status(200).send(update);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Notification/Topic/CreateCustomerTopic.js',
      error: err?.message,
      method: 'customerTopic',
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
      message: 'Não foi possível adicionar item',
      err: err.message,
    });
  }
};


// Realizar Inscriçao do usuário
const subscribe = async (nameTopic, customer) => {
  try {
    if (!customer || !customer.instanceIdToken) {
      return false;
    }

    const { data: response } = await notificationApi.post(`/v1/topic/user-register`, {
      topic: nameTopic, // informar o nome do tópico e não o ID
      instanceIdToken: customer.instanceIdToken,
    });

    if (!response || !response.status || response.listError !== null) {
      return false;
    }

    return true;
  } catch (err) {
    console.log('Err subscribe', err);
    return false;
  }
};

const unsubscribe = async (customer, topicsName) => {
  try {
    if (!customer || !customer.instanceIdToken) {
      return false;
    }

    if (!topicsName || topicsName.length <= 0) {
      return;
    }

    const { data: response } = await notificationApi.post(`/v1/topic/unsubscribe`, {
      topic: topicsName,
      instanceIdToken: customer.instanceIdToken,
    });

    return true;
  } catch (err) {
    console.log('Err unsubscribe', err);
    return false;
  }
};

const uniqueTopics = async (topics, notifTopic) => {
  return await uniqueCity(topics, notifTopic);
};

const uniqueCity = async (topics, notifTopic) => {
  try {
    let itens = [];
    let name = notifTopic.topic;
    let strSearch = 'city_';

    let strFirebase = process.env.FIREBASE_PATH || '';
    strFirebase = strFirebase.replace(/[/]/g, '');

    if (strFirebase && typeof strFirebase === 'string' && strFirebase.length > 1) {
      strSearch = `${strFirebase}_${strSearch}`;
    }

    let isCity = name.search(strSearch);

    if (isCity !== 0) {
      return topics;
    }

    let response = await Topic.find({ _id: topics }).lean();
    if (response && response.length > 0) {
      for (const item of response) {
        let isRepeat = item.topic.search(strSearch);
        if (isRepeat !== 0) {
          itens.push(item._id);
        }
      }
    }

    return itens;
  } catch (err) {
    console.log('Err city', err);
    return topics;
  }
};

const topicsName = async (topics) => {
  try {
    let itens = [];
    let response = await Topic.find({ _id: topics }).lean();

    if (response && response.length > 0) {
      for (const item of response) {
        itens.push(item.topic);
      }
    }

    return itens;
  } catch (err) {
    console.log('Err topicsName', err);
    return null;
  }
};

module.exports = customerTopic;
