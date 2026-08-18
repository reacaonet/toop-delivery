const Product = require("../../models/ProductModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const companyId = req.params.id;
    const { searchProduct, limit, page } = req.query;
    let filter = {};

    if (!companyId) {
      return res.status(400).send({
        message: "ID da company não localizado",
      });
    }

    filter.company = companyId;

    if (searchProduct) {
      filter.$or = [
        { name: { $regex: new RegExp(searchProduct, "i") } },
        { barcode: { $regex: new RegExp(searchProduct, "i") } },
      ];
    }

    const pageOptions = {
      page: parseInt(page, 10) || 0,
      limit: parseInt(limit, 10) || 10,
    };

    const list = await Product.find(filter)
      .sort("_id")
      .limit(pageOptions.limit)
      .skip(pageOptions.page * pageOptions.limit);

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Product/CompanyOfferController.js',
    error: dadosDoErro?.message,
    method: 'CompanyOfferController',
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
      mesage: "Falha ao encontrar Produto",
      error: dadosDoErro,
    });
  }
};
