const LogModel = require("../../../models/LogModel");

const contries = async (request, reply) => {
  try {
    const { language } = request.query;

    let list = [
      {
        name: "Brasil",
        value: "+55",
        mask: "(99) 99999-9999",
        min: 11,
        max: 11,
      },
      {
        name: "Portugal",
        value: "+351",
        mask: "999999999",
        min: 9,
        max: 9,
      },
      {
        name: "Angola",
        value: "+244",
        mask: "999999999",
        min: 9,
        max: 9,
      },
    ];

    if (language && language === "pt-AO") {
      list = reorderList("Angola", list);
    }

    if (language && (language === "pt" || language === "pt-PT")) {
      list = reorderList("Portugal", list);
    }

    return reply.send(list);
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Setting/App/CountriesController.js',
    error: err?.message,
    method: 'contries',
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

    return reply.status(400).send({
      message: "não foi possível listar",
      err: err.message,
    });
  }
};

const reorderList = (name, list) => {
  try {
    const index = list.findIndex(item => `${item.name}` === `${name}`);

    if (index > -1) {
      const item = list[index];
      list.splice(index, 1);
      list = [item].concat(list);
    }

    return list;
  } catch (err) {
    return list;
  }
};

module.exports = contries;
