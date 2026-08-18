const AppVersion = require("../../../models/Setting/AppVersionModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;

    const version = await AppVersion.create(data);
    if (version && version._id) {
      await AppVersion.updateMany({ _id: { $ne: payMethod._id }, store: version.store }, { status: false });
    }

    return res.send({
      status: 200,
      message: "Versão criada com sucesso",
      data: version,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Setting/AppVersion/CreateController.js',
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


    console.log("dadosDoErro", dadosDoErro);
    return res.status(400).send({
      message: "Falha ao criar versão",
      Error: dadosDoErro.message,
    });
  }
};
