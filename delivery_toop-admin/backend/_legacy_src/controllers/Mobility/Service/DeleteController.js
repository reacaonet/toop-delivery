const ServiceModel = require("../../../models/Mobility/Service/ServiceModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;

    // await Company.findOneAndRemove({ _id: id });

    await ServiceModel.findByIdAndUpdate(
      id,
      {
        $set: { deletedAt: new Date() },
      },
      {
        new: true,
      },
    );

    res.send({
      status: 200,
      message: "Registro deletado com sucesso",
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Service/DeleteController.js',
    error: dadosDoErro?.message,
    method: 'DeleteController',
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
      message: "Falha ao deletar Registro",
      error: dadosDoErro,
    });
  }
};
