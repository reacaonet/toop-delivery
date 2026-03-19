const firebaseAdmin = require("../../../services/firebase/firebaseAdmin");
const { getMessaging } = require("firebase-admin/messaging");
const LogModel = require("../../../models/LogModel");

module.exports = async (request, res) => {
  try {
    const { application, token, topics, unsubscribeTopic } = request.body || {};
    const listTopics = [];

    const app = await firebaseAdmin(`${application}`.toString());

    if (!app) {
      return res.status(400).send({
        message: "verifique as configurações ...",
      });
    }

    if (unsubscribeTopic && Array.isArray(unsubscribeTopic) && unsubscribeTopic.length > 0) {
      for await (const item of unsubscribeTopic) {
        try {
          if (item.name && item.value) {
            if (item.name === item.value) {
              await getMessaging(app).unsubscribeFromTopic(token, `${item.name}`);
            } else {
              await getMessaging(app).unsubscribeFromTopic(token, `${item.name}_${item.value}`);
            }
          }
        } catch (err) {
          console.log("fail unsubscribeTopic", err);
        }
      }
    }

    for await (const item of topics) {
      try {
        if (item.name === item.value) {
          const response = await getMessaging(app).subscribeToTopic(token, `${item.name}`);

          if (response && response.successCount === 1) {
            listTopics.push(`${item.name}`);
          }
        } else {
          const response = await getMessaging(app).subscribeToTopic(token, `${item.name}_${item.value}`);

          if (response && response.successCount === 1) {
            listTopics.push(`${item.name}_${item.value}`);
          }
        }
      } catch (err) {
        console.log("fail add in topic", err);
      }
    }

    return res.send({
      topics: listTopics,
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/Topic/CreateController.js",
      error: err?.message,
      method: "CreateController",
      type: "error",
      level: 0,
      origin: "backend",
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

    return res.status(400).send({
      message: "Falha ao criar registro",
      err: err.message,
    });
  }
};
