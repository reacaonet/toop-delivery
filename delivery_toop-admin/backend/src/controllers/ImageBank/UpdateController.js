const ImageBank = require('../../models/ImageBankModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    data.status = (
      ((typeof data.status === 'string') && data.status === "") ||
      (data.status === null)
    ) ? false : data.status;

    if (data.file) {
      data.images = [];
      if (Array.isArray(data.file)) {
        data.file.forEach(item => data.images.push(item.url));
      } else if (file.url) {
        data.images.push(file.url)
      }
    }

    const novoRegistro = await ImageBank.findOneAndUpdate({
      _id: id
    }, data, {
      upsert: true,
      new: true
    })
    .populate('packing', {name: 1});

    res.send({
      status: 200,
      message: "Banco de imagens atualizada com sucesso",
      data: novoRegistro
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/ImageBank/UpdateController.js',
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
      message: "Falha ao atualizar Banco de imagens",
      Error: dadosDoErro
    });
  }
};
