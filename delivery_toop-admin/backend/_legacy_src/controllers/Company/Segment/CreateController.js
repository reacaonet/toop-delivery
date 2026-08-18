const SegmentModel = require('../../../models/Company/SegmentModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const data = req.body;

    if (!data.file || (typeof data.file !== 'object')) {
      return res.status(400).send({
        message: 'Imagens inválidas'
      });
    }

    data.status = (
      ((typeof data.status === 'string') && data.status === "") ||
      (data.status === null)
    ) ? false : data.status;

    data.images = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images.push(data.url)
    }

    const segment = await SegmentModel.create(data);

    return res.send({
      status: 200,
      message: "Registro criado com sucesso",
      data: segment
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Company/Segment/CreateController.js',
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
      message: "Falha ao criar registro",
      Error: dadosDoErro
    });
  }
};
