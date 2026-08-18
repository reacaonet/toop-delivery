const Person = require("../../models/Person/PersonModel");
const IndicationModel = require("../../models/Mobility/Indication/IndicationModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (`${data.status}` === "true" || `${data.status}` === "false") {
      data.status = `${data.status}` === "true" ? true : false;
    }

    if (data.ddi) {
      data.ddi = decodeURIComponent(data.ddi);
    }

    const novoRegistro = await Person.findOneAndUpdate(
      {
        _id: id,
      },
      data,
      {
        upsert: true,
        new: true,
      },
    )
      .populate("city")
      .populate("franchise")
      .populate("company");

    if (data.code) {
      const isCode = await Person.findOne({ referralCode: data.code }).select({ _id: 1 }).lean();

      if (!isCode) {
        return res.status(400).send({
          message: "Código informado inválido",
        });
      }

      await IndicationModel.create({
        person: id,
        personReceive: isCode._id,
        referralCode: data.code,
        total: 20,
      });
    }

    res.send({
      status: 200,
      message: "Person atualizado com sucesso",
      data: novoRegistro,
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Person/UpdateController.js",
      error: err?.message,
      method: "UpdateController",
      type: "error",
      level: 0,
      origin: "backend",
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

    return res.status(400).send({
      message: "Falha ao atualizar Person",
      err: err.message,
    });
  }
};
