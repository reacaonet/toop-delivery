const mongoose = require("mongoose");
const Order = require("../../../../models/Shopping/order/orderStatusModel");
const LogModel = require("../../../../models/LogModel");

/**
 * GET
 * url - /v1/front/order
 * page - default(1)
 * pageSize - default(20)
 * status - default(null)
 * customer - default(null)
 * companyType - default(null)
 * company - default(null) // BY HEADER
 * sort - default ({createdAt: -1})
 * sortOrder - default(null) -> Exemple: &sortOrder=createdAt:-1
 */

const list = async (req, res) => {
  try {
    const { page, pageSize, status, companyType, customer, sortOrder, returnPayment = false } = req.query;

    const { isRoot, isFranchise, franchise, company, companies = [] } = req;

    // // /** TODO: OTIMIZAR QUERY DAS FRANQUIA */
    // if (isFranchise) {
    //   return res.status(200).send([]);
    // }

    let match = {};
    let matchCompany = {};
    let matchCustomer = {};

    let sort = { createdAt: -1 };
    let limit = parseInt(pageSize) || 20;
    let next = parseInt(page) - 1 || 0;
    const pageCurrent = parseInt(page) || 1;

    if (!companyType) {
      return res.status(400).send({
        message: "inform company type",
      });
    }

    if (company && !mongoose.isValidObjectId(company)) {
      return res.status(400).send({
        message: "company is invalid",
      });
    }

    if (status) {
      match.status = { $eq: status };
    }

    match.deletedAt = { $exists: false };

    if (companyType !== "ALL") {
      matchCompany["company.shoppingFlow"] = companyType === "restaurant" ? "MENU" : "PRODUCT";
    }

    // console.log(companies);
    if (isFranchise) {
      // match.franchise = mongoose.Types.ObjectId(franchise);
      match.company = { $in: companies.length > 0 ? companies : [company] };
    } else if (!isRoot || isRoot === false) {
      match.company = {
        $in: companies && Array.isArray(companies) && companies.length > 0 ? companies : [company],
      };
    }

    if (customer) {
      matchCompany["customer._id"] = { $eq: mongoose.Types.ObjectId(customer) };
    }

    if (sortOrder) {
      let params = sortOrder.split(";");

      for (const param of params) {
        let item = param.split(":", 2);
        if (item && item.length == 2) {
          if (isNaN(Number(item[1])) === false) {
            sort[item[0]] = Number(item[1]);
          }
        }
      }
    }

    let aggregate = [];

    let customerLook = {
      from: "customer",
      let: { customerId: "$customer" },
      as: "customer",
      pipeline: [
        {
          $match: { $expr: { $eq: ["$_id", "$$customerId"] } },
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
          $match: { $expr: { $eq: ["$_id", "$$deliveryId"] } },
        },
        { $limit: 1 },
        { $project: { address: 1 } },
      ],
    };

    let payment = {
      from: "payment",
      let: { payment: "$payment" },
      pipeline: [
        { $match: { $expr: { $in: ["$_id", "$$payment"] } } },
        {
          $project: {
            total: 1,
            totalCompany: 1,
            priceDelivery: 1,
            serviceCharge: 1,
            typePayment: 1,
            provider: 1,
            paymentProviderId: 1,
            card_holder_name: "$payload.card_holder_name",
            card_last_digits: "$payload.card_last_digits",
            card_brand: "$payload.card_brand",
          },
        },
        { $limit: 1 },
      ],
      as: "payment",
    };

    let companyLook = {
      from: "company",
      let: { companyId: "$company" },
      as: "company",
      pipeline: [
        {
          $match: { $expr: { $eq: ["$_id", "$$companyId"] } },
        },
        { $limit: 1 },
        { $project: { name: 1, images: 1, type: 1, shoppingFlow: 1 } },
      ],
    };

    let shoppingCartLook = {
      from: "shoppingCart",
      let: { cartId: "$shoppingCart" },
      as: "shoppingCart",
      pipeline: [
        {
          $match: { $expr: { $eq: ["$_id", "$$cartId"] } },
        },
        {
          $limit: 1,
        },
      ],
    };

    aggregate.push({ $match: match });

    aggregate.push({ $lookup: customerLook });
    aggregate.push({
      $unwind: { path: "$customer", preserveNullAndEmptyArrays: true },
    });

    if (matchCustomer && Object.keys(matchCustomer).length) {
      aggregate.push({ $match: matchCustomer });
    }

    aggregate.push({ $lookup: shoppingCartLook });
    aggregate.push({ $lookup: person });

    aggregate.push({ $lookup: customerDelivery });

    //caso seja necessário retornar o pagamento para o front
    if (returnPayment === true) aggregate.push({ $lookup: payment });

    aggregate.push({ $lookup: companyLook });

    aggregate.push({ $sort: sort });

    aggregate.push({
      $unwind: { path: "$shoppingCart", preserveNullAndEmptyArrays: true },
    });
    aggregate.push({
      $unwind: { path: "$customerDelivery", preserveNullAndEmptyArrays: true },
    });

    //caso seja necessário retornar o pagamento para o front
    if (returnPayment === true) {
      aggregate.push({
        $unwind: { path: "$payment", preserveNullAndEmptyArrays: true },
      });
    }

    aggregate.push({
      $unwind: { path: "$company", preserveNullAndEmptyArrays: true },
    });

    if (matchCompany && Object.keys(matchCompany).length) {
      aggregate.push({ $match: matchCompany });
    }

    if (limit > 0) {
      aggregate.push({ $skip: next * limit });
      aggregate.push({ $limit: limit });
    }

    const responseOrder = await Order.aggregate(aggregate);

    let totalOrders = await Order.aggregate([{ $match: match }, { $count: "total" }]);

    if (totalOrders && totalOrders[0] && totalOrders[0].total && typeof totalOrders[0].total === "number") {
      totalOrders = totalOrders[0].total;
    }

    return res.status(200).send({
      list: responseOrder,
      total: totalOrders,
      page: pageCurrent,
      pageLimit: limit,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Front/v1/Order/ListController.js',
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

    return res.status(400).send({
      message: "Fail list order",
      err: err.message,
    });
  }
};

module.exports = list;
