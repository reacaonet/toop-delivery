const mongoose = require("mongoose");
const Person = require("../../models/Person/PersonModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const listPorNome = req.query.listPorNome;
    const { tokenUser, company, companies, sortName, limit, franchise } = req;

    let filter = {};
    let limitReg = 50;
    const sort = {};

    // restringe por nivel de empresa/fraquia
    if (companies.length || company || franchise) {
      filter = {
        $or: [
          {
            company: {
              $in: companies.length > 0 ? companies : [company],
            },
          },
          { franchise: mongoose.Types.ObjectId(franchise) },
        ],
      };
    }

    if (limit && Number(limit) > 0) {
      limitReg = Number(limit);
    }

    if (sortName && (Number(sortName) === -1 || Number(sortName) === 1)) {
      sort.name = Number(sortName);
    }

    filter.deletedAt = {
      $exists: false,
    };

    if (listPorNome && typeof listPorNome === "string") {
      list = await Person.find(
        {
          ...filter,
          name: {
            $regex: ".*" + listPorNome.toLowerCase() + ".*",
            $options: "i",
          },
        },
        { name: 1 },
      )
        .limit(limitReg)
        .sort(sort)
        .lean(limitReg);

      return res.json(list);
    } else {
      return res.json([]);
    }
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Person/ListPorNomeController.js',
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

    console.log("Err message", err);

    return res.status(400).send({
      mesage: "Falha ao encontrar Person",
      error: err.message,
    });
  }
};
