const mongoose = require("mongoose");

const City = require("../../../models/Setting/CityModel");
const Franchise = require("../../../models/Franchise/FranchiseModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const { state, name, hasFranchise = false } = req.query;

    let data = {};

    data.deletedAt = {
      $exists: false,
    };

    if (state && !mongoose.Types.ObjectId.isValid(state)) {
      return res.status(400).send({
        message: "Id Estado inválido",
      });
    }

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "ID da cidade inválida",
      });
    }

    let list;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      list = await City.findById(id).populate("state", {
        name: 1,
        uf: 1,
      });
      return res.json(list);
    }

    if (state && mongoose.Types.ObjectId.isValid(state)) {
      data.state = state;
    }

    if (name && name.length) {
      data.name = { $regex: ".*" + name.toLowerCase() + ".*", $options: "i" };
    }

    let franchies = [];
    let response = [];

    if (hasFranchise) {
      franchies = await Franchise.find(
        {
          status: true,
          deletedAt: {
            $exists: false,
          },
        },
        { city: 1, state: 1, _id: 1 },
      ).lean();

      data._id = {
        $in: [...franchies.filter(i => mongoose.Types.ObjectId.isValid(i.city)).map(i => i.city)],
      };

      list = await City.find(data)
        .populate("state", {
          name: 1,
          uf: 1,
        })
        .lean();

      for (let i = 0; i < list.length; i++) {
        response.push({
          ...list[i],
          franchise: franchies.find(ii => `${ii.city}`.toString() === `${list[i]._id}`.toString()),
        });
      }
    } else {
      response = await City.find(data).populate("state", {
        name: 1,
        uf: 1,
      });
    }

    return res.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Setting/City/ListController.js',
      error: err?.message,
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

    console.log("err", err);

    return res.status(400).send({
      mesage: "Falha na busca de Cidade",
      err: err.message,
    });
  }
};
