const mongoose = require("mongoose");
const moment = require("moment");
const Popup = require("../../../models/tools/PopupModel");
const PopupView = require("../../../models/PopupViewModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Id inválido",
      });
    }

    const popupView = await PopupView.find({ person: id });

    const popups = popupView.map((item) => {
      return item.popup;
    });

    const result = await Popup.findOne({
      _id: { $nin: popups },
      startDate: { $lte: new Date(moment().add().startOf().format()) },
      endDate: { $gte: new Date(moment().endOf().format()) },
      status: true,
      $where: "this.vizualizations > this.quantityViews",
    }).sort({ priorities: -1 });

    return res.json(result);
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/Tools/Popup/ListPopupAppController.js',
      error: dadosDoErro?.message,
      method: 'ListPopupAppController',
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


    console.log("Error ", dadosDoErro);
    return res.status(400).send({
      mesage: "Falha ao encontrar Popups",
      error: dadosDoErro.message,
    });
  }
};
