const mongoose = require('mongoose');

const Group = require('../../models/GroupModel');
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

    // Trata status
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

    if (await Group.findOne({
        name: data.name,
        franchise: data.franchise,
        deletedAt: {
          $exists: false,
        }
      }))
      return res.status(400).send({
        message: "Já existe um Group com o mesmo nome",
        code: 1
      });

    const group = await Group.create(data);

    return res.send({
      status: 200,
      message: "Grupo criado com sucesso",
      data: group
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Group/CreateController.js',
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
      message: "Falha ao criar Grupo",
      Error: dadosDoErro
    });
  }
};
