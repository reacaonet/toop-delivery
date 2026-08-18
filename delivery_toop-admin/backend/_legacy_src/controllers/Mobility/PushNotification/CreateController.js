const axios = require('axios');

/** Model */
const PushNotificationModel = require('../../../models/Mobility/Notification/PushNotificationModel');

/** Service */
const notificationApi = require("../../../services/notification");
const LogModel = require("../../../models/LogModel");

module.exports = async (request, res) => {
  try {
    const {
      franchise,
      title,
      message,
      user = null,
      topic = null,
    } = request.body || {};

    if (!topic && !user) {
      return res.status(400).send({
        message: 'Insira um tópico de envio ou um usuário',
      });
    }

    if (!topic && !user.token) {
      return res.status(400).send({
        message: 'Usuário informado não possui token de notificação',
      });
    }

    const payload = {
      franchise,
      title,
      message,
    };

    if (user) {
      payload.user = user;
    }

    if (topic) {
      payload.topic = topic;
    }

    const response = await PushNotificationModel.create(payload);

    // envio por tópico
    if (topic) {
      try {
        const { data: respTopic } = await axios.post(
          `${process.env.HOST}:${process.env.PORT}/mobility/topic/send`,
          {
            franchise,
            topic,
            title,
            subject: message,
          },
        );

        if (respTopic && respTopic.response) {
          await PushNotificationModel.updateOne(
            {
              _id: response._id,
            },
            {
              status: 'success',
            },
          );
        }
      } catch (err) {
        await PushNotificationModel.updateOne(
          {
            _id: response._id,
          },
          {
            status: 'error',
            errMessage: err.message,
          },
        );
      }

      return res.status(200).send({
        message: 'Push Notification Tópico enviado',
      });
    }

    if (!user || !user.token) {
      return res.status(400).send({
        message: 'Insira um usuário para envio da notificação',
      });
    }

    try {
      const { data: respPush } = await notificationApi.post('/v1/app-notification/push', {
        user: {
          title: title,
          message: message,
          auth: user.token,
        },
        params: {
          title: title,
          message: message,
        },
        cloud_messaging_token: process.env.CLOUD_MESSAGING_TOKEN,
      });

      if (respPush) {
        await PushNotificationModel.updateOne(
          {
            _id: response._id,
          },
          {
            status: 'success',
          },
        );
      }
    } catch (err) {
      await PushNotificationModel.updateOne(
        {
          _id: response._id,
        },
        {
          status: 'error',
          errMessage: err.message,
        },
      );
    }

    return res.status(200).send({
      message: 'Push Notification Registrado',
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/PushNotification/CreateController.js',
      error: err?.message,
      method: 'CreateController',
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

    return res.status(400).send({
      message: 'Falha ao registar push notification',
      err: err.message,
    });
  }
};
