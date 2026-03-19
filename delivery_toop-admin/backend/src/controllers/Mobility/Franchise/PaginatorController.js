const mongoose = require('mongoose');

const FranchiseModel = require('../../../models/Franchise/FranchiseModel');
const LogModel = require("../../../models/LogModel")

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, name, email, companyName } = req.query;

    let filter = {};
    let list;
    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: 'Dados da paginação inválidos',
        Error: dadosDoErro,
      });
    }

    // --> name filter
    if (name && typeof name === 'string' && name.trim().length > 0) {
      filter.name = { $regex: '.*' + name.toLowerCase() + '.*', $options: 'i' };
    }

    // --> companyname filter
    if (companyName && typeof companyName === 'string' && companyName.trim().length > 0) {
      filter.companyName = {
        $regex: '.*' + companyName.toLowerCase() + '.*',
        $options: 'i',
      };
    }

    // --> email filter
    if (email && typeof email === 'string' && email.trim().length > 0) {
      filter.email = {
        $regex: '.*' + email.toLowerCase() + '.*',
        $options: 'i',
      };
    }

    // --> not deleted
    filter.deletedAt = {
      $exists: false,
    };

    list = await FranchiseModel.aggregate([{ $match: filter }, { $limit: parseInt(pageOut) }, { $skip: parseInt(pageIn) * parseInt(pageOut) }]);
    let numTotal = await FranchiseModel.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Franchise/PaginatorController.js',
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
      message: 'Falha ao encontrar registros para Paginação',
      Error: dadosDoErro,
    });
  }
};
