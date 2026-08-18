const Category = require("../../../../models/Accessories/CategoryModel");
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const listByName = req.query.listByName;
    //const { company, companies = [] } = req;

    let filter = {};
    //filter = { company: { $in: company ? [ObjectId(company)] : companies } };

    if (listByName && typeof listByName === "string") {
      list = await Category.find(
        {
          name: {
            $regex: ".*" + listByName.toLowerCase() + ".*",
            $options: "i",
          },
          filter,
        },
        { name: 1 }
      );
      return res.json(list);
    } else {
      return res.json([]);
    }
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Acessories/Category/ListPorNomeController.js',
      error: err?.message,
      method: 'ListPorNomeController',
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
      mesage: "Falha ao encontrar categoria",
      error: err.message,
    });
  }
};
