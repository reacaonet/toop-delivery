const RegisterDeliveryManModel = require("../../models/RegisterDeliveryManModel");
const FranchiseModel = require("../../models/Franchise/FranchiseModel");
const LogModel = require("../../models/LogModel");
const mongoose = require("mongoose");
const maxDistance = 13000;

module.exports = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { isRoot, franchise, franchises, company, companies = [] } = req;

    let filter = {};

    if (!isRoot) {
      const respFranchise = await FranchiseModel.findOne({ _id: franchise }).select({ location: 1, city: 1, state: 1 }).populate("city").lean();

      if (!respFranchise || !respFranchise._id) {
        return res.status(200).send([]);
      }

      // let lat = 0;
      // let lng = 0;

      // if (respFranchise.location && respFranchise.location.coordinates) {
      //   lat = respFranchise.location.coordinates[1];
      //   lng = respFranchise.location.coordinates[0];
      // }

      // filter.location = {
      //   $near: {
      //     $geometry: {
      //       type: "Point",
      //       coordinates: [Number(lng), Number(lat)],
      //     },
      //     $maxDistance: maxDistance,
      //   },
      // };

      filter = {
        ...filter,
        $or: [
          { city_id: mongoose.Types.ObjectId(respFranchise.city._id) },
          { $and: [{ city_id: { $exists: false } }, { city: { $regex: ".*" + respFranchise.city.name + ".*", $options: "i" } }] },
        ],
      };
    }

    let list;
    if (!page || !limit) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
      });
    }

    // console.log(JSON.stringify(filter));

    list = await RegisterDeliveryManModel.find(filter)
      .limit(parseInt(limit))
      .populate("city_id")
      .populate("state_id")
      .skip(parseInt(page) * parseInt(limit))
      .sort({ createdAt: -1 });

    let numTotal = await RegisterDeliveryManModel.find(filter).count();

    return res.status(200).send({ list, total: numTotal });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/RegisterDeliveryMan/PaginatorController.js',
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

    console.log("fail", err);
    return res.status(400).send({
      message: "Falha ao encontrar Paginação",
      err: err.message,
    });
  }
};
