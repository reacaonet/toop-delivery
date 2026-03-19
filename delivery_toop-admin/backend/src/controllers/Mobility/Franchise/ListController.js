const mongoose = require('mongoose');

const FranchiseModel = require('../../../models/Franchise/FranchiseModel');
const LogModel = require("../../../models/LogModel")

module.exports = async (req, res) => {
  try {
    // Opcional, retorna registro único
    const id = req.params.id;

    let { name, companyName, email, status } = req.query;

    let list = [];
    let filter = {};

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'Id inválido' });
    }

    // --> name filter
    if (name) {
      const decodeName = decodeURIComponent(name);
      filter.name = {
        $regex: '.*' + decodeName.toLowerCase() + '.*',
        $options: 'i',
      };
    }

    // --> companyName filter
    if (companyName) {
      const decodeCompanyName = decodeURIComponent(companyName);
      filter.companyName = {
        $regex: '.*' + decodeCompanyName.toLowerCase() + '.*',
        $options: 'i',
      };
    }

    // --> email filter
    if (email) {
      const decodeEmail = decodeURIComponent(email);
      filter.email = {
        $regex: '.*' + decodeEmail.toLowerCase() + '.*',
        $options: 'i',
      };
    }

    if (`${status}` === 'false' || `${status}` === 'true') {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== 'all') {
      filter.status = { $eq: true };
    }

    filter.deletedAt = {
      $exists: false,
    };

    list = await FranchiseModel.find(filter);

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Franchise/ListController.js',
    error: dadosDoErro?.message,
    method: 'ListController',
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
      message: 'Falha ao encontrar Franquia',
      Error: dadosDoErro.message,
    });
  }
};
