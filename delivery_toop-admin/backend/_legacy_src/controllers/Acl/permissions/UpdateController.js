const AclPermissions = require('../../../models/Acl/permissionsModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const novoRegistro = await AclPermissions.findOneAndUpdate({
      _id: id
    }, data, {
      upsert: true,
      new: true
    }).populate('roles');

    res.send({
      status: 200,
      message: "Permissions atualizado com sucesso",
      data: novoRegistro
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Acl/permissions/UpdateController.js',
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
      message: "Falha ao atualizar permissions",
      Error: dadosDoErro
    });
  }
};
