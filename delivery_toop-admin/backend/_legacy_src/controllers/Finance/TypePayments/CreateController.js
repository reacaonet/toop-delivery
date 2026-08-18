const mongoose = require('mongoose');

const  FncTypePaymentsModel = require('../../../models/Finance/TypePaymentsModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    if (!data.file || (typeof data.file !== 'object')) {
      return res.status(400).send({
        message: 'Imagens inválidas'
      });
    }

    data.status = (
      ((typeof data.status === 'string') && data.status === "") ||
      (data.status === null)
    ) ? false : data.status;

    data.image = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.image.push(item.url));
    } else if (data.url) {
      data.image.push(data.url)
    }

    let FncTypePayments = await FncTypePaymentsModel.create(data);

    return res.send({
      status: 200,
      message: "Tipos de Pagamento criado com sucesso",
      data: FncTypePayments
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/TypePayments/CreateController.js',
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
      message: "Falha ao criar tipos de pagamento",
      Error: dadosDoErro
    });
  }
};
