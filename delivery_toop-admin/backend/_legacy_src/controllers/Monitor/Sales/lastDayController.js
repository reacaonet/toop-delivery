const moment = require("moment");
const Order = require("../../../models/Shopping/order/orderStatusModel");
const LogModel = require("../../../models/LogModel");
/**
 * GET
 * dataDay (YYYY-MM-DD) - Data Current
 */
function LastDayController() {
  async function list(req, res) {
    try {
      let { status, dataDay } = req.query;
      const { isRoot, company: companyFranchise, companies = [] } = req;

      let datas = [];
      let results = [];

      if (!dataDay) {
        dataDay = moment().utc(0).subtract("24", "hours");
      } else {
        dataDay = moment(dataDay).utc(0).subtract("24", "hours");
      }

      for (let i = 0; i < 24; i++) {
        datas.push({
          start: dataDay.format("YYYY-MM-DD HH:00:00Z"),
          end: dataDay.format("YYYY-MM-DD HH:59:59Z"),
        });
        dataDay.add("1", "hours");
      }

      if (!status || status.length <= 2) {
        status = "FINISHED";
      }

      for await (const data of datas) {
        const match = {
          updatedAt: {
            $gte: new Date(data.start),
            $lte: new Date(data.end),
          },
        };

        if (!isRoot || isRoot !== true) {
          match.company = {
            $in: companies.length > 0 ? companies : [companyFranchise],
          };
        }

        let response = await Order.aggregate([
          {
            $match: match,
          },
          {
            $project: {
              _id: 0,
              updatedAt: 1,
              Finalized: {
                $cond: { if: { $eq: ["$status", `${status}`] }, then: 1, else: 0 },
              },
            },
          },
          {
            $group: {
              _id: {
                hour: { $hour: "$updatedAt" },
              },
              total: { $sum: 1 },
              finished: { $sum: "$Finalized" },
            },
          },
        ]);

        let total = 0;
        let finished = 0;
        if (response && response.length > 0) {
          total = response[0].total;
          finished = response[0].finished;
        }

        results.push({
          start: data.start,
          end: data.end,
          total: total,
          finished: finished,
        });
      }

      return res.status(200).send(results);
    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Monitor/Sales/lastDayController.js',
        error: err?.message,
        method: 'list',
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

      // console.log('err', err);
      return res.status(400).send({
        message: "Fail list day",
      });
    }
  }

  return {
    list,
  };
}

module.exports = LastDayController;
