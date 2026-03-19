const Department = require("../../../models/Shopping/DepartmentModel");
const CompanyModel = require("../../../models/Company/CompanyModel");
const LogModel = require("../../../models/LogModel");
const { Types } = require("mongoose");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, company, onlyCompany = false, franchise, term } = req.query;
    const filter = {};
    const or = [];

    if (franchise) {
      or.push({
        franchise: franchise,
      });

      or.push({
        franchise: {
          $exists: false,
        },
      });
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

    let list = [];
    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    if (term && typeof term === "string" && term.trim().length > 0) {
      filter.name = { $regex: ".*" + term.toLowerCase() + ".*", $options: "i" };
    }

    if (onlyCompany) {
      // filter.franchise = {
      //   $exists: false,
      // };

      filter.company = Types.ObjectId(company);
    }

    if (company) {
      list = await Department.aggregate([
        {
          $match: filter,
        },
        {
          $lookup: {
            from: "sortDepartment",
            let: { departmentId: "$_id", companyId: "$company" },
            as: "sort",
            pipeline: [
              {
                $match: {
                  $and: [{ $expr: { $eq: ["$department", "$$departmentId"] } }, { $expr: { $eq: ["$company", Types.ObjectId(company)] } }],
                },
              },
            ],
          },
        },
        {
          $unwind: { path: "$sort", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            id: 1,
            suggesteds: 1,
            showInApp: 1,
            status: 1,
            name: 1,
            createdAt: 1,
            updatedAt: 1,
            sort: { $ifNull: ["$sort.order", 999999] },
            sort_id: "$sort._id",
          },
        },
        {
          $sort: {
            sort: 1,
            name: 1,
          },
        },
        {
          $limit: parseInt(pageOut),
        },
        {
          $skip: parseInt(pageIn) * parseInt(pageOut),
        },
      ]);
    } else {
      list = await Department.aggregate([
        {
          $match: filter,
        },
        {
          $limit: parseInt(pageOut),
        },
        {
          $skip: parseInt(pageIn) * parseInt(pageOut),
        },
      ]);
    }

    let numTotal = await Department.countDocuments(filter);
    return res.json({ list, total: numTotal });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Department/PaginatorController.js',
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
