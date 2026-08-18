const Topic = require('../../../../models/Notification/TopicModel');
const LogModel = require("../../../../models/LogModel");

/**
 * POST
 * /v2/notification-topic
 * params
 *  - topic
 */
const createTopic = async (req, res) => {
  try {
    const { topic, slug } = req.body;

    if (!topic || typeof topic !== 'string' || topic.length < 3) {
      return res.status(400).send({
        message: 'Informe um tópico válido'
      });
    }

    let str = topic
      .normalize("NFD")
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/ +/g, "_")
      .replace(/[\u0300-\u036f]/g, "") // converte acentos
      .toLowerCase();

    // Ambientes
    let strFirebase = process.env.FIREBASE_PATH || '';
    strFirebase = strFirebase.replace(/[/]/g, '');

    // identificador para chaves unicas
    if (slug && typeof slug === 'string' && slug.length > 1) {
      str = `${slug}_${str}`;
    }

    if (strFirebase && typeof strFirebase === 'string' && strFirebase.length > 1) {
      str = `${strFirebase}_${str}`;
    }

    let search = await Topic.findOne({ topic: str }).lean();

    if (search) {
      return res.status(200).send(search);
    }

    const newTopic = await Topic.create({
      name: topic,
      topic: str
    });

    return res.status(200).send(newTopic);

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Notification/Topic/CreateTopic.js',
      error: err?.message,
      method: 'createTopic',
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
      message: 'Não foi possível cadastrar topico',
      err: err.message,
    });
  }
};

module.exports = createTopic;
