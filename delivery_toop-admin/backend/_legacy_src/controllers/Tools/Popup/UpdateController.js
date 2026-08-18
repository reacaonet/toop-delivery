const Popup = require('../../../models/tools/PopupModel');
const LogModel = require("../../../models/LogModel");

const moment = require("moment");

const mongoose = require("mongoose");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    console.log('teste dataaa', data)

    if (data.startHour && data.endHour) {
      let startDate = moment(data.startDate);
      startDate.set({
        h: data.startHour.substring(0, 2),
        m: data.startHour.substring(2, 2),
        s: 0,
      });

      let endDate = moment(data.endDate);
      endDate.set({
        h: data.endHour.substring(0, 2),
        m: data.endHour.substring(2, 2),
        s: 0,
      });

      data.startDate = startDate;
      data.endDate = endDate;
    } else {
      let startDate = moment(data.startDate);
      startDate.set({
        h: 0,
        m: 0,
        s: 0,
      });

      let endDate = moment(data.endDate);
      endDate.set({
        h: 23,
        m: 59,
        s: 0,
      });

      data.startDate = startDate;
      data.endDate = endDate;
    }

    data.status =
      (typeof data.status === "string" && data.status === "") ||
        data.status === null
        ? false
        : data.status;

        data.images = [];
        if (Array.isArray(data.file)) {
          data.file.forEach(item => data.images.push(item.url));
        } else if (data.url) {
          data.images = [];
          data.images.push(data.url)
        }

        if (!data.file || (typeof data.file !== 'object')) {
          delete data.file;
          delete data.images;
        }
    

    const novoRegistro = await Popup.findOneAndUpdate({
      _id: id
    }, data, {
      upsert: true,
      new: true
    }).populate('company');

    res.send({
      status: 200,
      message: "Popup atualizado com sucesso",
      data: novoRegistro
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Tools/Popup/UpdateController.js',
    error: dadosDoErro?.message,
    method: 'dadosDoErro',
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
      Error: dadosDoErro
    });
  }
};
