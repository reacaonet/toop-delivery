const mongoose = require("mongoose");

const User = require("../../models/UserModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, person } = req.query;
    const { company, companies = [], franchise } = req;

    let filter = {};
    let list;
    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    if (person && mongoose.Types.ObjectId.isValid(person)) {
      filter.person = person;
    }

    // restringe os dados a nivel da franquia
    filter = { ...filter, $or: [{ company: { $in: companies.length > 0 ? companies : [company] } }, { franchise: franchise }] };

    filter.deletedAt = {
      $exists: false,
    };

    list = await User.find(filter)
      .populate("person", { name: 1, email: 1, status: 1 })
      .populate("company", { name: 1 })
      .populate("franchises", { name: 1 })
      .populate("companies", { name: 1 })
      .sort({ name: 1 })
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut));

    let numTotal = await User.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/User/PaginatorController.js',
      error: dadosDoErro?.message,
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
      Error: dadosDoErro,
    });
  }
};
