const LogModel = require("../../../models/LogModel");

function ListController() {
  const Order = require("../../../models/Shopping/order/orderStatusModel");

  /**
   * GET
   * limit - 25
   * next - 0
   * sort - createdAt
   * status - null
   */
  async function list(req, res) {
    try {
      const { page, pageSize, status } = req.query;
      const { isRoot, company: companyFranchise, companies = [] } = req;

      let match = {};
      let sort = { createdAt: -1 };
      let limit = parseInt(page) || 25;
      let next = parseInt(pageSize) - 1 || 0;

      if (status) {
        match.status = {
          $eq: status,
        };
      } else {
        match.status = {
          $nin: ["CANCELED", "FINISHED"],
        };
      }

      if (!isRoot || isRoot !== true) {
        match.company = {
          $in: companies.length > 0 ? companies : [companyFranchise],
        };
      }

      let aggregate = [];

      let customer = {
        from: "customer",
        let: { customerId: "$customer" },
        as: "customer",
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$customerId"] },
            },
          },
          { $limit: 1 },
          { $project: { person: 1, email: 1 } },
        ],
      };

      let person = {
        from: "person",
        let: { personId: "$customer.person" },
        as: "customer.person",
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$personId"] },
            },
          },
          { $limit: 1 },
          { $project: { name: 1 } },
        ],
      };

      let customerDelivery = {
        from: "customer_delivery_address",
        let: { deliveryId: "$customerDelivery" },
        as: "customerDelivery",
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$deliveryId"] },
            },
          },
          { $limit: 1 },
          { $project: { address: 1 } },
        ],
      };

      let payment = {
        from: "payment",
        let: { paymentId: "$payment" },
        as: "payment",
        pipeline: [
          {
            $project: {
              idArray: {
                $cond: {
                  // ultimo id Payment como principal
                  if: { $isArray: ["$$paymentId"] },
                  then: "$$paymentId",
                  else: ["$$paymentId"],
                },
              },
              total: 1,
              totalCompany: 1,
              priceDelivery: 1,
              serviceCharge: 1,
            },
          },
          {
            $match: {
              $expr: { $in: ["$_id", [{ $arrayElemAt: ["$idArray", -1] }]] },
            },
          },
          { $limit: 1 },
        ],
      };

      let company = {
        from: "company",
        let: { companyId: "$company" },
        as: "company",
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$companyId"] },
            },
          },
          { $limit: 1 },
          { $project: { name: 1, images: 1 } },
        ],
      };

      aggregate.push({ $match: match });

      aggregate.push({ $lookup: customer });
      aggregate.push({ $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } });
      aggregate.push({ $lookup: person });

      aggregate.push({ $lookup: customerDelivery });
      aggregate.push({ $lookup: payment });
      aggregate.push({ $lookup: company });
      aggregate.push({ $sort: sort });

      aggregate.push({ $unwind: { path: "$customerDelivery", preserveNullAndEmptyArrays: true } });
      aggregate.push({ $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } });
      aggregate.push({ $unwind: { path: "$company", preserveNullAndEmptyArrays: true } });

      if (limit > 0) {
        aggregate.push({ $skip: next * limit });
        aggregate.push({ $limit: limit });
      }

      const responseOrder = await Order.aggregate(aggregate);
      return res.status(200).send(responseOrder);
    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Monitor/Order/ListController.js',
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

      console.log("Error", err);
      return res.status(400).send({
        message: "Fail process list",
      });
    }
  }

  return {
    list,
  };
}

module.exports = ListController;
