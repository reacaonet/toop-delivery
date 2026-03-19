const City = require('../../../models/Setting/CityModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;

        const novoRegistro = await City.findOneAndUpdate({ _id: id }, data, { upsert: true, new: true }).populate('state', {name: 1, uf: 1});

        res.send({
            status: 200,
            message: "Cidade atualizada com sucesso",
            data: novoRegistro
        });
    } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Setting/City/UpdateController.js',
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
            message: "Falha ao atualizar Cidade",
            Error: dadosDoErro
        });
    }
};