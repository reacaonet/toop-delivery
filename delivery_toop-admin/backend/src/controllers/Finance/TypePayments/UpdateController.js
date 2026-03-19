const  FncTypePayments = require('../../../models/Finance/TypePaymentsModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    data.status = (
      ((typeof data.status === 'string') && data.status === "") ||
      (data.status === null)
    ) ? false : data.status;

    data.images = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images = [];
      data.images.push(data.url)
    }

    if (!data.file || (typeof data.file !== 'object')) {
      delete data.file;
      delete data.images;
    }
    
    const novoRegistro = await FncTypePayments.findOneAndUpdate({
      _id: id
    }, data, {
      upsert: true,
      new: true
    });

    res.send({
      status: 200,
      message: "Tipos de pagamento atualizado com sucesso",
      data: novoRegistro
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/TypePayments/UpdateController.js',
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
      message: "Falha ao atualizar tipos de pagamento",
      Error: dadosDoErro
    });
  }
};
