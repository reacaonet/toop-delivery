const mongoose = require('mongoose');
const Tabloid = require('../../models/TabloidModel');
const LogModel = require("../../models/LogModel");

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


    data.images = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (file.url) {
      data.images.push(file.url)
    }

    const tabloid2 = await Tabloid.create(data);

    return res.send({
      status: 200,
      message: "Tabloid criado com sucesso",
      data: tabloid2
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Tabloid/CreateController.js',
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
      message: 'Falha ao criar Tabloid',
      error: dadosDoErro
    });
  }
};
