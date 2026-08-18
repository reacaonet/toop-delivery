const DepartmentMob = require('../../../models/Shopping/DepartmentModelMobile');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id

    await DepartmentMob.findByIdAndUpdate(
      id,
      {
        $set: {
          deletedAt: new Date(),
        },
      },
      {
        new: true,
      },
    )

    res.send({
      status: 200,
      message: "Departamento deletado com sucesso"
    });
  } catch (error) {
    await LogModel.create({
      path: 'src/controllers/Shopping/DepartmentMobile/DeleteController.js',
      error: error?.message,
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
      message: "Falha ao deletar Departamento",
      Error: dadosDoErro
    });
  }
}
