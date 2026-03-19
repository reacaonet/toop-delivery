const Cart = require("../../../models/Shopping/CartModel");
const LogModel = require("../../../models/LogModel");
module.exports = async (req, res) => {
  try {
    const { companytype } = req.query;
    //const { company, companies = [] } = req;

    // let filter = {};
    // restringe os dados a nivel da franquia
    let filter = { company: { $ne: null } };
    let companytypeFilter;

    if (companytype) {
      companytypeFilter = {
        $expr: { $eq: ["$_id", "$$companyId"] },
        type: { $eq: companytype },
      };
    } else {
      companytypeFilter = { $expr: { $eq: ["$_id", "$$companyId"] } };
    }

    const list = await Cart.aggregate([
      { $match: filter },
      {
        $sort: { updatedAt: -1 },
      },
      { $limit: 40 },
      {
        $lookup: {
          from: "company",
          let: { companyId: "$company" },
          as: "company",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$companyId"] } },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $lookup: {
          from: "customer",
          let: { customerId: "$customer" },
          as: "customer",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$customerId"] } },
            },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "person",
          let: { personId: "$customer.person" },
          as: "person",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$personId"] } },
            },
            { $limit: 1 },
            { $project: { name: 1 } },
          ],
        },
      },
    ]);

    let listFilted = [];
    list.map((p, index) => {
      if (p.company !== null) {
        listFilted.push(p);
      }
    });

    return res.json(listFilted);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/AllController.js',
      error: err?.message,
      method: 'AllController',
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
      message: "Falha ao encontrar Carrinhos",
      err: err.message,
    });
  }
};
