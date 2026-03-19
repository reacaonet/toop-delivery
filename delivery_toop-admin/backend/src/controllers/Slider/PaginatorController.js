const Slider = require("../../models/SliderModel");
const LogModel = require("../../models/LogModel");

const mongoose = require("mongoose");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, name } = req.query;
    const { company, companies = [] } = req;

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
    filter.company = { $in: companies.length > 0 ? companies : [company] };

    list = await Slider.find(filter)
      .populate("productId", { name: 1 })
      .populate("foodId", { name: 1 })
      .populate("company", { name: 1 })
      .populate("segment", { name: 1})
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut))
      .catch(err => console.log("aaa", err));

    let numTotal = await Slider.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Slider/PaginatorController.js',
    error: dadosDoErro?.message,
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


    console.log("bb", dadosDoErro);
    return res.status(400).send({
      message: "Falha ao encontrar Paginação",
      Error: dadosDoErro,
    });
  }
};
