const Category = require("../../../models/Application/CategoryModel");
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    // data.status = (
    //   ((typeof data.status === 'string') && data.status === "") ||
    //   (data.status === null)
    // ) ? false : data.status;

    if (`${data.status}` == "true" || `${data.status}` == "false") {
      data.status = `${data.status}` == "true" ? true : false;
    }

    // data.showInApp = (typeof data.showInApp === "string" && data.showInApp === "") || data.showInApp === null ? false : data.showInApp;

    if (`${data.showInApp}` === "true" || `${data.showInApp}` === "false") {
      data.showInApp = `${data.showInApp}` === "true" ? true : false;
    }

    if (`${data.showHome}` === "true" || `${data.showHome}` === "false") {
      data.showHome = `${data.showHome}` === "true" ? true : false;
    }

    data.images = [];

    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images = [];
      data.images.push(data.url);
    }

    if (!data.file || typeof data.file !== "object") {
      delete data.file;
      delete data.images;
    }

    const novoRegistro = await Category.findOneAndUpdate(
      {
        _id: id,
      },
      data,
      {
        upsert: true,
        new: true,
      },
    );

    res.send({
      status: 200,
      message: "Sucesso ao Atualizar categoria",
      data: novoRegistro,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Aplicativos/Category/UpdateController.js',
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


    console.log("error", dadosDoErro);

    return res.status(400).send({
      message: "Falha ao Atualizar categoria",
      Error: dadosDoErro,
    });
  }
};
