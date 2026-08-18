const Category = require("../../../models/Application/CategoryModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { franchise, franchises = [] } = req;
    const { pageIn, pageOut } = req.query;
    const filter = {};
    const filterFranchise = {};

    if (franchise || franchises) {
      filterFranchise["segment.franchise"] = {
        $in: franchise ? [franchise] : [...franchises],
      };
    }

    filter.deletedAt = {
      $exists: false,
    };

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    const list = await Category.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "companySegment",
          let: { segmentId: "$segment" },
          as: "segment",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$segmentId"] },
              },
            },

          ],
        },
      },
      {
        $unwind: { path: "$segment", preserveNullAndEmptyArrays: true },
      },
      {
        $match: filterFranchise,
      },
      {
        $sort: {
          name: 1,
          order: 1,
        },
      },
    ]);

    let numTotal = await Category.find({
      ...filter,
      ...filterFranchise,
    }).countDocuments();
    return res.json({ list, total: numTotal });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Aplicativos/Category/PaginatorController.js',
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
      Error: err.message,
    });
  }
};
