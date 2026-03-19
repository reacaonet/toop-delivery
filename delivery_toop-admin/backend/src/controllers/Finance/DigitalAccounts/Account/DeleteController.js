const AccountModel = require("../../../../models/Finance/DigitalAccounts/AccountModel");
const LogModel = require('./../../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;

    await AccountModel.findByIdAndUpdate(
      id,
      {
        $set: { deletedAt: new Date() },
      },
      {
        new: true,
      }
    );

    res.send({
      status: 200,
      message: "Conta Bancária deletada com sucesso",
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/DigitalAccounts/Account/DeleteController.js',
    error: dadosDoErro?.message,
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


    return res.status(400).send({
      message: "Falha ao deletar Conta Bancária",
      error: dadosDoErro,
    });
  }
};
