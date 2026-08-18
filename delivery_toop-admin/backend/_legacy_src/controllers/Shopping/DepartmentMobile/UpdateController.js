const DepartmentMob = require('../../../models/Shopping/DepartmentModelMobile');
const Integration = require('../../../services/integrationApi');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    data.status = (
      ((typeof data.status === 'string') && data.status === "") ||
      (data.status === null)
    ) ? false : data.status;

    data.showInApp = (
      ((typeof data.showInApp === 'string') && data.showInApp === "") ||
      (data.showInApp === null)
    ) ? false : data.showInApp;

    const novoRegistro = await DepartmentMob.findOneAndUpdate({
      _id: id
    }, data, {
      upsert: true,
      new: true
    });



    res.send({
      status: 200,
      message: "Derpatamento atualizado com sucesso",
      data: novoRegistro
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Shopping/DepartmentMobile/UpdateController.js',
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
      message: "Falha ao atualizar Derpatamento",
      Error: dadosDoErro
    });
  }
};

/* const updateIntegration = async (suggested) => {
  try {
    let querySuggested =
      Object.keys(suggested).map((key) => `suggested=${suggested[key]}`).join('&');

    await Integration.get(`/all/products-queue?${querySuggested}`);
    return
  } catch (err) {
  await LogModel.create({
    path: '',
    error: err?.message,
    method: '',
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

    let error = err;
    if (err.response && err.response.data) {
      error = err.response.data;
    }

    console.log('Fail updateIntegration', error);
    return;
  }
}
 */
