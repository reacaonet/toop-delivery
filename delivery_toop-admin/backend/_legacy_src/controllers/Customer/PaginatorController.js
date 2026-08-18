const mongoose = require("mongoose");

const CompanyModel = require("../../models/Company/CompanyModel");
const CustomerModel = require("../../models/CustomerModel");
const FranquiseModel = require("../../models/Franchise/FranchiseModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { isRoot, franchise } = req;

    let list = [];
    const filter = {};

    if (!page || !limit) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
      });
    }

    if (!isRoot || `${isRoot}` === false) {
      const franquiseCurrent = await FranquiseModel.findOne({
        _id: franchise,
      }).lean();

      if (!franquiseCurrent || !franquiseCurrent.location || !franquiseCurrent.location.coordinates) {
        filter["address.location"] = {
          $geoWithin: {
            $centerSphere: [[0, 0], Number(process.env.maxMiles / 3963.2)],
          },
        };
      } else {
        filter["address.location"] = {
          $geoWithin: {
            $centerSphere: [
              [Number(franquiseCurrent.location.coordinates[0]), Number(franquiseCurrent.location.coordinates[1])],
              Number(process.env.maxMiles / 3963.2),
            ],
          },
        };
      }
    }

    list = await CustomerModel.aggregate([
      {
        $lookup: {
          from: "customer_delivery_address",
          let: { customerId: "$_id" },
          as: "address",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customer", "$$customerId"] },
                main: true,
                isDeleted: false,
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      { $unwind: { path: "$address", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "person",
          localField: "person",
          foreignField: "_id",
          as: "person",
        },
      },
      { $unwind: { path: "$person", preserveNullAndEmptyArrays: true } },
      {
        $match: filter,
      },
      {
        $skip: parseInt(page) * parseInt(limit),
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    const total = await CustomerModel.aggregate([
      {
        $lookup: {
          from: "customer_delivery_address",
          let: { customerId: "$_id" },
          as: "address",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customer", "$$customerId"] },
                main: true,
                isDeleted: false,
              },
            },
            {
              $project: { location: 1 },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $unwind: { path: "$address", preserveNullAndEmptyArrays: true },
      },
      {
        $match: filter,
      },
      {
        $group: {
          _id: {},
          total: {
            $sum: 1,
          },
        },
      },
    ]);

    let numTotal = 0;
    if (total && total.length > 0) {
      numTotal = total[0].total;
    }

    return res.status(200).send({
      list,
      total: numTotal,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Customer/PaginatorController.js',
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
