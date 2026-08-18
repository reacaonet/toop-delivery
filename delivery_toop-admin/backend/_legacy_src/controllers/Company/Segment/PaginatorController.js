const SegmentModel = require("../../../models/Company/SegmentModel");
const LogModel = require("../../../models/LogModel");
const mongoose = require("mongoose");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, name } = req.query;
    const { franchise, franchises = [] } = req;

    let filter = {};
    let list;
    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
      });
    }

    if (name && typeof name === "string" && name.trim().length > 0) {
      filter.name = { $regex: ".*" + name.toLowerCase() + ".*", $options: "i" };
    }

    filter.deletedAt = { $exists: false };

    // restringe os dados a nivel da franquia
    filter.franchise = { $in: franchise ? [franchise] : [...franchises] };

    list = await SegmentModel.find(filter)
      .populate("franchise", { name: 1 })
      .limit(parseInt(pageOut))
      .sort({
        order: 1,
      })
      .skip(parseInt(pageIn) * parseInt(pageOut))
      .catch(err => console.log("error", err));

    let numTotal = await SegmentModel.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Company/Segment/PaginatorController.js',
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
