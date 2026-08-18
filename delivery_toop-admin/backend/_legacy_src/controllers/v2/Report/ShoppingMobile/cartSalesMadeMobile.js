/* LIBS */
const moment = require("moment");
const mongoose = require("mongoose");

/* Model */
const Cart = require("../../../../models/Shopping/CartModel");
const LogModel = require('../../../../models/LogModel');

/** Util */
const Util = require("../../../../utils");

/**
 * GET
 * Url - /v2/report/shopping/carts-created-sales-made
 * Params
 * company (Optional || ObjectId )
 */
const cartSalesMadeMobile = async (req, res) => {
  try {
    // const {company} = req.query;
    //const company = req.headers["company"];
    const company = req.params.company_id;

    /** TODO: OTIMIZAR QUERY */
    return res.status(200).send([]);

    if (!company || !mongoose.isValidObjectId(company)) {
      return res.status(400).send({
        message: "Company não identificada",
      });
    }

    let timezone = "America/Sao_Paulo";

    let dataAfter = Util.getDate();
    let dataBefore = Util.getDate(30).toDate();

    let lte = Util.getDate().toDate();
    let gte = Util.getDate(30).toDate();

    let listDays = [];
    let match = {};

    match.createdAt = {
      $gte: gte,
      $lte: lte,
    };

    // restringe os dados a nivel da franquia
    if (company) {
      match.company = { $in: company ? [company] : null };
    }

    match.isDeleted = false;
    match.status = { $in: ["inProgress", "purchaded"] };

    const list = await Cart.aggregate([
      {
        $match: match,
      },
      {
        $lookup: {
          from: "orderStatus",
          let: { cartId: "$_id" },
          as: "order",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$shoppingCart", "$$cartId"] },
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $unwind: { path: "$order", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "payment",
          let: { payment: "$order.payment" },
          as: "payment",
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    "$_id",
                    {
                      $cond: {
                        if: { $isArray: ["$$payment"] },
                        then: "$$payment",
                        else: [],
                      },
                    },
                  ],
                },
              },
            },
            {
              $project: {
                total: 1,
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $unwind: { path: "$payment", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: {
            month: {
              $month: {
                date: "$createdAt",
                timezone: timezone,
              },
            },
            day: {
              $dayOfMonth: {
                date: "$createdAt",
                timezone: timezone,
              },
            },
            year: {
              $year: {
                date: "$createdAt",
                timezone: timezone,
              },
            },
          },
          total: { $sum: 1 },
          totalOrder: {
            $sum: {
              $cond: ["$order._id", 1, 0],
            },
          },
          average: {
            $avg: "$payment.total",
          },
          totalSales: { $sum: "$payment.total" },
          totalApproved: {
            $sum: {
              $cond: {
                if: { $eq: ["$order.status", "FINISHED"] },
                then: "$payment.total",
                else: 0,
              },
            },
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);

    while (dataAfter >= dataBefore) {
      let month = dataAfter.format("MM");
      let day = dataAfter.format("DD");
      let year = dataAfter.format("YYYY");

      listDays.push({
        month,
        day,
        year,
        total: 0,
        totalOrder: 0,
        average: 0,
        totalSales: 0,
        totalApproved: 0,
      });

      dataAfter.subtract(1, "days");
    }

    let index = 0;
    let listReport = listDays.map(item => {
      if (list[index] && list[index]._id && list[index]._id.month == item.month && list[index]._id.day == item.day) {
        let info = list[index];
        index += 1;

        return {
          month: info._id.month,
          day: info._id.day,
          year: info._id.year,
          total: info.total,
          totalOrder: info.totalOrder,
          average: info.average ? Number(`${info.average}`).toFixed(2) : 0,
          totalSales: info.totalSales ? Number(`${info.totalSales}`).toFixed(2) : 0,
          totalApproved: info.totalApproved ? Number(`${info.totalApproved}`).toFixed(2) : 0,
        };
      } else {
        return item;
      }
    });

    return res.status(200).send(listReport);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Report/ShoppingMobile/cartSalesMadeMobile.js',
      error: err?.message,
      method: 'cartSalesMadeMobile',
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
      message: "Não foi possível listar dados",
      err: err.message,
    });
  }
};

module.exports = cartSalesMadeMobile;
