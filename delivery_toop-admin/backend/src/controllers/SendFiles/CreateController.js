const SendFiles = require("../../services/sendFiles");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const {folder} = req.body;

    if (!folder || !req.file_path || !req.file_name) {
      return res.status(400).send({
        message: "Falha ao enviar file",
        Error: "arquivo não localizado",
      });
    }

    const result = await SendFiles(req.file_path, req.file_name, folder);

    return res.send({
      status: 200,
      message: "Arquivo enviada com sucesso",
      data: result,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/SendFiles/CreateController.js',
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


    console.log(dadosDoErro);
    return res.status(400).send({
      message: "Falha ao enviar file",
      Error: dadosDoErro,
    });
  }
};
