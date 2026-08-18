const AclPermissions = require('../../../models/Acl/permissionsModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const data = req.body;

    let permissions = await AclPermissions.create(data);
    permissions = await permissions.populate('roles').execPopulate();

    return res.send({
      status: 200,
      message: "Permissions criado com sucesso",
      data: permissions,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Acl/permissions/CreateController.js',
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
      message: "Falha ao criar permissions",
      Error: dadosDoErro,
    });
  }
};
