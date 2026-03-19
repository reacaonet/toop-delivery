const Person = require("../../models/Person/PersonModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, name, cpf } = req.query;
    const { tokenUser, isRoot, isFranchise, company, companies, franchise } = req;

    let filter = {};
    let list;

    // restringe por nivel de empresa/fraquia
    if (isFranchise) {
      if (companies.length <= 0 && !company) return res.status(200).send([]);
      filter = {
        company: {
          $in: companies.length > 0 ? companies : [company],
        },
      };
    }

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
      });
    }

    if (name && typeof name === "string" && name.trim().length > 0) {
      filter.name = { $regex: ".*" + name.toLowerCase() + ".*", $options: "i" };
    }

    if (cpf && typeof cpf === "string" && cpf.trim().length > 0) {
      filter.cpf = { $regex: ".*" + cpf.toLowerCase() + ".*", $options: "i" };
    }

    filter.deletedAt = {
      $exists: false,
    };

    list = await Person.find(filter)
      .populate("city")
      .populate("company")
      .populate("franchise")
      .sort({
        name: 1,
      })
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut));

    let numTotal = await Person.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Person/PaginatorController.js',
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

    console.log(err);
    return res.status(400).send({
      message: "Falha ao encontrar Paginação",
      err: err.message,
    });
  }
};
