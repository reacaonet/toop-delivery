const RegisterDeliveryMan = require("../../models/RegisterDeliveryManModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;

    const novoStatus = await RegisterDeliveryMan.findOneAndUpdate(
      {
        _id: id,
      },
      {
        status: payload.status,
        message: payload.message
      },
      {
        upsert: false,
        new: true
      }
    );


    res.send({
      status: 200,
      message: "Status atualizado com sucesso",
      data: novoStatus,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/RegisterDeliveryMan/UpdateController.js',
      error: err?.message,
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
      message: "Falha ao atualizar status",
      err: err.message,
    });
  }
};
