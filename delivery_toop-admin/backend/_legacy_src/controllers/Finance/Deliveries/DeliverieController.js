const mongoose = require("mongoose");
const moment = require("moment");

const OrderModel = require("../../../models/Shopping/order/orderStatusModel");
const LogModel = require("../../../models/LogModel");

const reportDeliveries = async (req, res) => {
  try {
    const { pageIn = 0, pageOut = 10, startDate, endDate, companyFilter, typePayment, deliveryMan } = req.query;

    const { isRoot, companies = [] } = req;

    let timeZone = "America/Sao_Paulo";
    let zoneH = -3;
    let filter = {};
    let filterDelivery = null;
    const aggregate = [];

    filter.status = "FINISHED";

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: moment(`${startDate} 00:00:00`).utcOffset(zoneH, true).toDate(),
        $lte: moment(`${endDate} 23:59:59`).utcOffset(zoneH, true).toDate(),
      };
    }

    if (companyFilter) {
      filter["company"] = mongoose.Types.ObjectId(companyFilter);
    } else if (!isRoot || isRoot === false) {
      filter["company"] = { $in: companies };
    }

    if (typePayment && typeof typePayment === "string") {
      if (typePayment === "APP") {
        filter["typePayment"] = { $in: ["PAGARME", "BRASPAG"] };
      } else {
        filter["typePayment"] = `${typePayment}`;
      }
    }

    if (deliveryMan && mongoose.isValidObjectId(deliveryMan)) {
      filterDelivery = {
        "deliveryMan._id": mongoose.Types.ObjectId(deliveryMan),
      };
    }

    filter.deliveryMan = { $exists: true };

    aggregate.push({ $match: filter });

    aggregate.push({
      $project: {
        status: 1,
        payment: 1,
        typePayment: 1,
        company: 1,
        order_number: 1,
        typeSchedule: 1,
        createdAt: 1,
        deliveryMan: 1,
      },
    });

    aggregate.push({
      $lookup: {
        from: "deliveryMan",
        let: { id: "$deliveryMan" },
        as: "deliveryMan",
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$id"] },
            },
          },
          {
            $lookup: {
              from: "person",
              localField: "person",
              foreignField: "_id",
              as: "person",
            },
          },
          { $limit: 1 },
          {
            $unwind: { path: "$person", preserveNullAndEmptyArrays: true },
          },
        ],
      },
    });

    aggregate.push({
      $unwind: { path: "$deliveryMan", preserveNullAndEmptyArrays: true },
    });

    aggregate.push({
      $lookup: {
        from: "payment",
        localField: "payment",
        foreignField: "_id",
        as: "payment",
      },
    });

    aggregate.push({
      $unwind: { path: "$payment", preserveNullAndEmptyArrays: true },
    });

    aggregate.push({
      $lookup: {
        from: "company",
        localField: "company",
        foreignField: "_id",
        as: "company",
      },
    });

    aggregate.push({
      $unwind: { path: "$company", preserveNullAndEmptyArrays: true },
    });

    aggregate.push({ $sort: { createdAt: -1 } });

    const agregatePaninator = [...aggregate];
    agregatePaninator.push({
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    });

    if (filterDelivery) {
      aggregate.push({
        $match: filterDelivery,
      });
    }

    aggregate.push({
      $addFields: {
        date: {
          $dateToString: {
            format: "%d/%m/%Y %H:%M",
            date: "$createdAt",
            timezone: timeZone,
          },
        },
      },
    });

    aggregate.push({ $skip: parseInt(pageIn) * parseInt(pageOut) });
    aggregate.push({ $limit: parseInt(pageOut) });
    const response = await OrderModel.aggregate(aggregate);

    let numTotal = 0;
    const totalPaginator = await OrderModel.aggregate(agregatePaninator);

    if (totalPaginator && totalPaginator.length > 0 && totalPaginator[0].count) {
      numTotal = totalPaginator[0].count;
    }

    return res.status(200).send({
      list: response,
      total: numTotal,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Finance/Deliveries/DeliverieController.js',
      error: err?.message,
      method: 'reportDeliveries',
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
      message: "Não foi possível listar",
      err: err.message,
    });
  }
};

module.exports = reportDeliveries;
