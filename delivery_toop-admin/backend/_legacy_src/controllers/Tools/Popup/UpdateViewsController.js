const mongoose = require("mongoose");
const Popup = require("../../../models/tools/PopupModel");
const PopupView = require("../../../models/PopupViewModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const { person } = req.body;

    if (!person || !mongoose.Types.ObjectId.isValid(person)) {
      return res.status(400).send({
        message: "Person inválido",
      });
    }

    let result;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      result = await Popup.findById(id);
    } else if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Id inválido",
      });
    }

    const popupView = await PopupView.create({ popup: id, person });

    const popup = await Popup.findOneAndUpdate(
      {
        _id: id,
      },
      { quantityViews: result.quantityViews + 1 },
      {
        upsert: true,
        new: true,
      }
    );

    res.send({
      status: 200,
      message: "Popup atualizada com sucesso",
      data: [popup, popupView],
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Tools/Popup/UpdateViewsController.js',
    error: err?.message,
    method: 'UpdateViewsController',
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
      message: "Falha ao atualizar Popup",
      Error: dadosDoErro,
    });
  }
};
