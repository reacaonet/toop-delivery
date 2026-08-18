const mongoose = require("mongoose");

const SliderModel = require("../../../models/Mobility/Slider/sliderModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, target } = req.query;
    const { isRoot, franchise } = req;

    const filter = {};

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
      });
    }

    if (!isRoot) {
      filter.franchise = mongoose.Types.ObjectId(franchise);
    }

    if (target) {
      const decodeTarget = decodeURIComponent(target);
      filter.target = {
        $regex: ".*" + decodeTarget.toLowerCase() + ".*",
        $options: "i",
      };
    }

    filter.deletedAt = {
      $exists: false,
    };

    const list = await SliderModel.find(filter)
      .populate("franchise", { name: 1 })
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut));

    const numTotal = await SliderModel.find(filter).countDocuments();
    return res.send({ list, total: numTotal });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/Slider/PaginatorController.js',
      error: err?.message,
      method: 'PaginatorController',
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
      message: "Falha ao encontrar Paginação",
      err: err.message,
    });
  }
};
