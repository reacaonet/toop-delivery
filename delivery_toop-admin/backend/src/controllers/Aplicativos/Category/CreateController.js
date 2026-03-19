const Category = require("../../../models/Application/CategoryModel");
const LogModel = require('../../../models/LogModel');

const mongoose = require("mongoose");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    if (!data.file || typeof data.file !== "object") {
      return res.status(400).send({
        message: "Imagens inválidas",
      });
    }

    data.status = (typeof data.status === "string" && data.status === "") || data.status === null ? false : data.status;

    data.showInApp = (typeof data.showInApp === "string" && data.showInApp === "") || data.showInApp === null ? false : data.showInApp;

    if (`${data.showHome}` === "true" || `${data.showHome}` === "false") {
      data.showHome = `${data.showHome}` === "true" ? true : false;
    }

    data.segment = (typeof data.segment === "string" && data.segment === "") || data.segment === null ? false : data.segment;

    data.images = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images.push(data.url);
    }

    let roles = await Category.create(data);

    return res.send({
      status: 200,
      message: "Categoria criado com sucesso",
      data: roles,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Aplicativos/Category/CreateController.js',
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
      message: "Falha ao criar categoria",
      Error: dadosDoErro,
    });
  }
};
