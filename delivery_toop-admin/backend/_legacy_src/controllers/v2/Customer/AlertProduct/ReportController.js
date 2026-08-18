/** Model */
const AlertProduct = require("../../../../models/Customer/AlertProduct/AlertProduct");
const LogModel = require("../../../../models/LogModel");

/**
 * GET
 * URL - /v2/customer-alert-product/alert-product/report
 */
const report = async (req, res) => {
  try {
    const { page, limit } = req.query;
    //const { company, companies = [] } = req;

    let total = 0;
    let totalPage = 0;
    let nPerPage = 50;
    let pageNumber = 1;

    let filter = {
      active: true,
    };
    // restringe os dados a nivel da franquia

    if (page && page > 0) {
      pageNumber = Number(`${page}`);
    }

    if (limit && limit > 0) {
      nPerPage = Number(`${limit}`);
    }

    let response = await AlertProduct.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$barcode",
          qtd: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "product",
          let: { barcode: "$_id" },
          as: "product",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$barcode", "$$barcode"] },
              },
            },
            {
              $project: {
                name: 1,
                images: 1,
                price: 1,
                pricePromotion: 1,
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $unwind: { path: "$product", preserveNullAndEmptyArrays: true },
      },
      {
        $sort: { qtd: -1 },
      },
      {
        $skip: pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0,
      },
      {
        $limit: nPerPage,
      },
    ]);

    let totalResponse = await AlertProduct.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$barcode",
        },
      },
    ]).count("total");

    if (totalResponse && totalResponse.length >= 0 && totalResponse[0].total) {
      total = totalResponse[0].total;
      totalPage = Math.ceil(total / nPerPage);
    }

    let list = {};
    list.response = response;

    list.pagination = {
      page: pageNumber,
      limit: nPerPage,
    };

    list.total = {
      documents: total,
      pages: totalPage,
    };

    return res.status(200).send(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Customer/AlertProduct/ReportController.js',
      error: err?.message,
      method: 'report',
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

    return res.status(200).send({
      message: "Falha ao listar dados",
      err: err.message,
    });
  }
};

module.exports = report;
