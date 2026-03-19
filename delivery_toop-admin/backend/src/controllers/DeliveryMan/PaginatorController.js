const mongoose = require("mongoose");
const FranchiseModel = require("../../models/Franchise/FranchiseModel");
const LogModel = require("../../models/LogModel");
const maxDistance = process.env.maxMetersDeliveryMan;

const DeliveryMan = require("../../models/DeliveryMan/DeliveryManModel");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, person, isOnline } = req.query;
    const { isRoot, franchise, franchises, company, companies = [] } = req;

    let filter = {};
    let list;

    if (!isRoot) {
      // const respFranchise = await FranchiseModel
      //   .findOne({ _id: franchise })
      //   .select({ location: 1 })
      //   .lean();

      // if (!respFranchise && !respFranchise._id) {
      //   return res.status(200).send([]);
      // }

      // let lat = 0
      // let lng = 0

      // if (respFranchise.location && respFranchise.location.coordinates) {
      //   lat = respFranchise.location.coordinates[1]
      //   lng = respFranchise.location.coordinates[0]
      // }

      // filter.location = {
      //   $near: {
      //     $geometry: {
      //       type: 'Point',
      //       coordinates: [Number(lng), Number(lat)]
      //     },
      //     $maxDistance: maxDistance
      //   }
      // };

      filter.franchise = franchise;
    }

    filter.deletedAt = {
      $exists: false,
    };

    let isOnlineValid = isOnline ? `${isOnline}` : undefined;
    if (isOnlineValid === "false" || isOnlineValid === "true") {
      filter.isOnline = JSON.parse(`${isOnlineValid}`);
    }

    if (person && mongoose.Types.ObjectId.isValid(person)) {
      filter.person = person;
    }

    if ((pageIn, pageOut)) {
      list = await DeliveryMan.find(filter)
        .populate("person", { name: 1 })
        .populate("company", { name: 1 })
        .populate("companyService", { name: 1 })
        .populate("franchise", { name: 1 })
        .populate("deliveryFee.division.company", { name: 1 })
        .sort({
          "person.name": 1,
        })
        .limit(parseInt(pageOut))
        .skip(parseInt(pageIn) * parseInt(pageOut));

      let numTotal = await DeliveryMan.find(filter).count();
      return res.json({ list, total: numTotal });
    } else {
      list = await DeliveryMan.find(filter);
    }

    return res.json(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/PaginatorController.js',
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

    console.log("err", err);

    return res.status(400).send({
      message: "Falha ao encontrar Paginação",
      err: err.message,
    });
  }
};
