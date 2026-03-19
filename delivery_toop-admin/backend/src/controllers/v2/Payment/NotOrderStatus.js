const moment = require("moment");
const Payment = require("../../../models/Shopping/PaymentModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut } = req.query;
    //const { company, companies = [] } = req;

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    const dateFinish = new Date(moment().utc().endOf().format("YYYY-MM-DD"));
    const dateInit = new Date(moment().add(-30, "days").utc().startOf().format("YYYY-MM-DD"));

    const filter = {};

    filter.statusPayload = { $eq: "2" };

    filter.order = { $exists: false };

    filter.createdAt = {
      $gte: dateInit,
      $lte: dateFinish,
    };

    // restringe os dados a nivel da franquia

    const list = await Payment.aggregate([
      { $match: filter },
      {
        $lookup: {
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
          ],
        },
      },
      { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
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
              $match: {
                $expr: { $eq: ["$_id", "$$personId"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: "$person", preserveNullAndEmptyArrays: true } },
      {
        $sort: { createdAt: -1 },
      },
      { $skip: parseInt(pageIn) * parseInt(pageOut) },
      { $limit: parseInt(pageOut) },
    ]);

    let numTotal = await Payment.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/v2/Payment/NotOrderStatus.js',
    error: dadosDoErro?.message,
    method: 'NotOrderStatus',
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
      mesage: "Falha ao obter Payments sem OrderStatus",
      error: dadosDoErro,
    });
  }
};
