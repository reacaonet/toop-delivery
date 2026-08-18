const ticketsModel = require('../../../models/HelpDesk/TicketsModel');
const LogModel = require("../../../models/LogModel");

const mongoose = require('mongoose');

module.exports = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const filter = {};
    filter.deletedAt = { $exists: false };

    let list;
    if (!page || !limit) {
      return res.status(400).send({
        message: 'Dados da paginação inválidos',
        Error: dadosDoErro,
      });
    }

    list = await ticketsModel
      .find(filter)
      .populate('company', { name: 1 }) // AppOfferCompan
      .populate('person', { name: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(page) * parseInt(limit))
      .sort({ createdAt: -1 });

    let numTotal = await ticketsModel.find().countDocuments();
    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/HelpDesk/Tickets/PaginatorController.js',
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


    return res.status(400).send({
      message: 'Falha ao encontrar Paginação',
      Error: dadosDoErro,
    });
  }
};
