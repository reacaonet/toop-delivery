/** Modules */
const Topic = require('../../../../models/Notification/TopicModel');
const LogModel = require("../../../../models/LogModel");

/**
 * GET
 * /v2/notification-topic
 */

const listTopics = async (req, res) => {
  try {

    const { topic } = req.query;
    const filter = {};

    if (topic) {
      filter.topic = {
        $regex: '.*' + topic.toLowerCase() + '.*', $options: 'i'
      };
    }

    const response = await Topic.find(filter).lean();
    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Notification/Topic/ListTopics.js',
      error: err?.message,
      method: 'listTopics',
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
      message: 'Falha ao listar topicos',
      err: err.message,
    });
  }
};

module.exports = listTopics;
