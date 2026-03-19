const mongoose = require('mongoose');
const Slider = require('../../models/SliderModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    if (!data.file || (typeof data.file !== 'object')) {
      return res.status(400).send({
        message: 'Imagens inválidas'
      });
    }

    data.status = (
      ((typeof data.status === 'string') && data.status === "") ||
      (data.status === null)
    ) ? false : data.status;

    data.companyClick = (
      ((typeof data.companyClick === 'string') && data.companyClick === "") ||
      (data.companyClick === null)
    ) ? false : data.companyClick;

    data.images = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images.push(data.url)
    }

    let slider = await Slider.create(data);
    slider = await slider.populate('company').execPopulate();

    return res.send({
      status: 200,
      message: "Slider criado com sucesso",
      data: slider
    });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/Slider/CreateController.js',
      error: dadosDoErro?.message,
      method: 'CreateController',
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
      message: "Falha ao criar Slider",
      Error: dadosDoErro
    });
  }
};
