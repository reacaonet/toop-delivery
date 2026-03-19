const mongoose = require("mongoose");

const State = require("../../../models/Setting/StateModel");
const FranchiseModel = require("../../../models/Franchise/FranchiseModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { hasFranchise = false } = req.query;
    const state = req.params.id;
    let data = {};

    if (state && !mongoose.Types.ObjectId.isValid(state)) {
      return res.status(400).send({
        message: "Id do Estado inválido",
      });
    }

    if (state) {
      data._id = state;
    }

    if (hasFranchise) {
      const franchies = await FranchiseModel.find(
        {
          deletedAt: {
            $exists: false,
          },
        },
        { city: 1, state: 1 },
      );

      data._id = { $in: [...franchies.filter(i => mongoose.Types.ObjectId.isValid(i.state)).map(i => i.state)] };
    }

    const list = await State.find(data);

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Setting/State/ListController.js',
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
      mesage: "Falha na busca de Estado",
      error: dadosDoErro,
    });
  }
};
