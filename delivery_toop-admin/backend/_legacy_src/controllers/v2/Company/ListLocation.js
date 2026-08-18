const Company = require("../../../models/Company/CompanyModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { isOpen } = req.query;

    let filter = {};

    if (isOpen) {
      filter = { "companyDelivery.isOpen": isOpen === "true" ? true : false };
    }

    const list = await Company.aggregate([
      { $match: { status: true } },
      {
        $lookup: {
          from: "company_delivery",
          localField: "companyDelivery",
          foreignField: "_id",
          as: "companyDelivery",
        },
      },
      { $unwind: { path: "$companyDelivery", preserveNullAndEmptyArrays: true } },
      {
        $match: filter,
      },
    ]);

    return res.json(list);
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/v2/Company/ListLocation.js',
      error: dadosDoErro?.message,
      method: 'ListLocation',
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
      message: "Falha ao listar Empresas",
      Error: dadosDoErro.message,
    });
  }
};
