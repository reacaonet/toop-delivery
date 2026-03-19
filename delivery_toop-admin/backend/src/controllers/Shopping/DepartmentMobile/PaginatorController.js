const DepartmentMob = require("../../../models/Shopping/DepartmentModelMobile");
const CompanyModel = require("../../../models/Company/CompanyModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, company, franchise } = req.query;
    const filter = {};
    const or = [];

    if (franchise) {
      filter.franchise = franchise;
    }

    if (company) {
      const respCompany = await CompanyModel.findOne({
        _id: company,
      })
        .select({
          franchise: 1,
        })
        .lean();

      if (respCompany && respCompany.franchise) {
        or.push({
          franchise: respCompany.franchise,
        });
      }

      or.push({
        company: company,
      });

      or.push({
        franchise: {
          $exists: false,
        },
      });
    }

    if (or.length > 0) {
      filter.$or = or;
    }

    filter.deletedAt = {
      $exists: false,
    };

    let list;
    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    list = await DepartmentMob.find(filter)
      .sort({
        name: 1,
      })
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut));
    let numTotal = await DepartmentMob.countDocuments(filter);
    return res.json({ list, total: numTotal });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/DepartmentMobile/PaginatorController.js',
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
      err: err.message,
    });
  }
};
