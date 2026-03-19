const mongoose = require("mongoose");

const FranchiseModel = require("../../models/Franchise/FranchiseModel");
const UserModel = require("../../models/UserModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    // Opcional, retorna registro único
    const id = req.params.id;

    let { name, email, status, user, limit, sortName } = req.query;
    const { franchises } = req;

    let list = [];
    let filter = {};
    let limitReg = 100;
    const sort = {};

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Id inválido" });
    }

    if (id) {
      const getF = await FranchiseModel.findById(id);
      return res.status(200).send(getF);
    }

    if (franchises) {
      filter._id = {
        $in: franchises,
      };
    }

    // --> name filter
    if (name) {
      const decodeName = decodeURIComponent(name);
      filter.name = {
        $regex: ".*" + decodeName.toLowerCase() + ".*",
        $options: "i",
      };
    }

    // --> email filter
    if (email) {
      const decodeEmail = decodeURIComponent(email);
      filter.email = {
        $regex: ".*" + decodeEmail.toLowerCase() + ".*",
        $options: "i",
      };
    }

    if (`${status}` === "false" || `${status}` === "true") {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== "all") {
      filter.status = { $eq: true };
    }

    filter.deletedAt = {
      $exists: false,
    };

    if (limit && Number(limit) > 0) {
      limitReg = Number(limit);
    }

    if (sortName && (Number(sortName) === -1 || Number(sortName) === 1)) {
      sort.name = Number(sortName);
    }

    if (user && mongoose.Types.ObjectId.isValid(user)) {
      const userF = await UserModel.findOne({
        _id: mongoose.Types.ObjectId(user),
      });
      if (userF.franchises) {
        filter._id = {
          $in: userF.franchises,
        };
        list = await FranchiseModel.find(filter).sort(sort).limit(limitReg).lean();
      }
    } else {
      list = await FranchiseModel.find(filter).sort(sort).limit(limitReg).lean();
    }

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Franchise/ListController.js',
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
      message: "Falha ao encontrar Franquia",
      Error: dadosDoErro.message,
    });
  }
};
