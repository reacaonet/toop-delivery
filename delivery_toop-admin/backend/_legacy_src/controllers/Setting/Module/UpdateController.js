const Module = require('../../../models/Setting/ModuleModel');
const LogModel = require("../../../models/LogModel")

module.exports = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;

        const novoRegistro = await Module.findOneAndUpdate({ _id: id }, data, { upsert: true, new: true }).populate('module', {name: 1, status: 1});

        data.status = (
            ((typeof data.status === 'string') && data.status === "") ||
            (data.status === null)
          ) ? false : data.status;

        res.send({
            status: 200,
            message: "Registro atualizado com sucesso",
            data: novoRegistro
        });
    } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Setting/Module/UpdateController.js',
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
            message: "Falha ao atualizar Registro",
            Error: dadosDoErro
        });
    }
};