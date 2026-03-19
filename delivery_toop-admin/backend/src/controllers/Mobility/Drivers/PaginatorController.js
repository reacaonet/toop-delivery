const mongoose = require("mongoose");

const DriversModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const filter = {};
    let list;

    const { pageIn = 0, pageOut = 10, franchise, service, approved, online, name } = req.query;
    const { isRoot, franchise: franchiseAuth } = req;

    if (!isRoot) {
      filter.franchise = mongoose.Types.ObjectId(franchiseAuth);
    }

    // --> name filter
    if (name && typeof name === 'string' && name.trim().length > 0) {
      filter.name = { $regex: '.*' + name.toLowerCase() + '.*', $options: 'i' };
    }

    if (franchise && mongoose.Types.ObjectId.isValid(franchise)) {
      filter.franchise = mongoose.Types.ObjectId(franchise);
    }

    if (service && mongoose.Types.ObjectId.isValid(service)) {
      filter.service = mongoose.Types.ObjectId(service);
    }

    if (`${online}` === "true" || `${online}` === "false") {
      filter.online = `${online}` === "true" ? true : false;
    }

    if (`${approved}` === "true" || `${approved}` === "false") {
      filter.approved = `${approved}` === "true" ? true : false;
    }

    filter.deletedAt = {
      $exists: false,
    };

    list = await DriversModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "franchise",
          let: { id: "$franchise" },
          as: "franchise",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
                deletedAt: { $exists: false },
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $lookup: {
          from: "service",
          localField: "services",
          foreignField: "_id",
          as: "services",
        },
      },
      {
        $unwind: { path: "$service", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          phone: 1,
          email: 1,
          password: 1,
          birthDate: 1,
          online: 1,
          identityDocuments: 1,
          address: 1,
          selfiePhoto: 1,
          approved: 1,
          sevices: 1,
          carsDocument: 1,
          cnhDocuments: 1,
          vehicleManufacturer: 1,
          vehicleModel: 1,
          vehicleNameplate: 1,
          vehicleYear: 1,
          vehicleColor: 1,
          activeRunStatus: 1,
          franchise: {
            $arrayElemAt: ["$franchise", 0],
          },
          services: {
            _id: 1,
            name: 1,
          },
          percentService: 1,
          genre: 1,
          bankData: 1,
          creditBalance: 1,
          block: 1,
        },
      },
      {
        $sort: {
          name: 1,
          approved: -1,
        },
      },
      { $skip: parseInt(pageIn) * parseInt(pageOut) },
      { $limit: parseInt(pageOut) },
    ]);

    const numTotal = await DriversModel.find(filter).countDocuments();
    return res.json({ list, total: numTotal });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/Drivers/PaginatorController.js',
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

    return res.status(400).send({
      message: "Falha ao encontrar Paginação",
      err: err.message,
    });
  }
};
