const mongoose = require('mongoose');

const CityModel = require('../../../models/Setting/CityModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, name } = req.query;
    const { } = req;

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

    filter.deletedAt = {
      $exists: false,
    };


    list = await CityModel.find(filter)
      .populate('state', {
        name: 1,
        uf: 1
      })
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut));

    let numTotal = await CityModel.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Setting/City/PaginatorController.js',
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

    console.log(err);
    return res.status(400).send({
      message: "Falha ao encontrar Paginação",
      err: err.message,
    });
  }
};
