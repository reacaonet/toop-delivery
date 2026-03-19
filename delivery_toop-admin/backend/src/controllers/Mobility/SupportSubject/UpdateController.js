const mongoose = require("mongoose");

const SupportSubjectModel = require("../../../models/Mobility/SupportSubject/SupportSubjectModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    data.status = (typeof data.status === "string" && data.status === "") || data.status === null ? false : data.status;

    if (data.franchise?._id) {
      data.franchise = data.franchise?._id;
    }

    const registerUpdate = await SupportSubjectModel.findOneAndUpdate({ _id: id }, data, {
      upsert: true,
      new: true,
    });

    res.send({
      status: 200,
      message: "Assunto/motivo atualizado com sucesso",
      data: registerUpdate,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/SupportSubject/UpdateController.js',
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
      message: "Falha ao Atualizar assunto/motivo",
      Error: dadosDoErro,
    });
  }
};
