const firebaseAdmin = require('../../../services/firebase/firebaseAdmin');
const { getMessaging } = require('firebase-admin/messaging');
const LogModel = require("../../../models/LogModel");

module.exports = async (request, res) => {
  try {
    const {
      topic,
      title,
      subject,
      priority = 'max',
      franchise,
    } = request.body || {};

    const app = await firebaseAdmin();

    let conditional = '';

    conditional += `'${topic}' in topics && `;
    conditional += `'application_root' in topics && `;
    conditional += `'franchise_${franchise}' in topics`;

    const message = {
      data: {},
      notification: {
        title: title,
        body: subject,
      },
      android: {
        data: {},
        priority: 'high',
        notification: {
          title: title,
          body: subject,
          priority: priority,
          visibility: 'public',
          notificationCount: 1,
          defaultVibrateTimings: true,
        },
      },
      // topic: topic,
      condition: conditional,
    };

    const response = await getMessaging(app).send(message);

    return res.send({
      response,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/Topic/SendController.js',
      error: err?.message,
      method: 'SendController',
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
      message: 'Falha ao criar registro',
      err: err.message,
    });
  }
}
