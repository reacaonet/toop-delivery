const mongoose = require("mongoose");
const moment = require("moment");

const BankTransactionsModel = require("../../../../models/Finance/DigitalAccounts/BankTransactionsModel");
const LogModel = require("../../../../models/LogModel");
// const AccountModel = require("../../../../models/Finance/DigitalAccounts/AccountModel");
// const getAccountByHolder = require("./../../../../services/Finance/DigitalAccounts/getAccountByHolder");
// const getAgencyFranchise = require("./../../../../services/Finance/DigitalAccounts/getAgencyFranchise");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, name, type, status, startDate, endDate, person, companyFilter, typePayment } = req.query;
    const { tokenUser, isRoot, isCompany, isFranchise, company, companies, franchise } = req;
    let search = [];
    let matchFilter = {};
    let orAccount = [];
    let andAccount = [];

    let timeZone = "America/Sao_Paulo";
    let zoneH = -3;

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
      });
    }

    let filter = {};

    if (startDate && endDate) {
      search.push({
        $and: [
          {
            transactionDate: {
              $gte: moment(`${startDate} 00:00:00`).utcOffset(zoneH, true).toDate(),
            },
          },
          {
            transactionDate: {
              $lte: moment(`${endDate} 23:59:59`).utcOffset(zoneH, true).toDate(),
            },
          },
        ],
      });
    }

    if (name && typeof name === "string" && name.trim().length > 0) {
      filter.name = { $regex: ".*" + name.toLowerCase() + ".*", $options: "i" };
    }

    filter.status = { $nin: ["CANCELED"] };

    if (!isRoot && isFranchise) {
      andAccount.push({
        $and: [
          {
            "originAccount.agency.franchise": {
              $in: franchise && Array.isArray(franchise) ? franchise : [franchise],
            },
          },
        ],
      });

      andAccount.push({
        $and: [
          {
            "destinationAccount.agency.franchise": {
              $in: franchise && Array.isArray(franchise) ? franchise : [franchise],
            },
          },
        ],
      });
    } else if (!isRoot && isCompany) {
      andAccount.push({
        $and: [
          {
            "originAccount.onModel": "Company",
            "originAccount.holder._id": {
              $in: companies && Array.isArray(companies) ? companies : [company],
            },
          },
        ],
      });

      andAccount.push({
        $and: [
          {
            "destinationAccount.onModel": "Company",
            "destinationAccount.holder._id": {
              $in: companies && Array.isArray(companies) ? companies : [company],
            },
          },
        ],
      });
    }

    if (andAccount && andAccount.length > 0) {
      matchFilter["$and"] = [
        {
          $or: andAccount,
        },
      ];
    }

    if (search && search.length > 0) {
      filter["$and"] = search;
    }

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    filter.deletedAt = { $exists: false };

    // console.log('filter', filter)

    // Filtro adicional
    if (companyFilter) {
      orAccount.push({
        "originAccount.holder._id": mongoose.Types.ObjectId(companyFilter),
        "originAccount.onModel": "Company",
      });

      orAccount.push({
        "destinationAccount.holder._id": mongoose.Types.ObjectId(companyFilter),
        "destinationAccount.onModel": "Company",
      });
    }

    if (person) {
      orAccount.push({
        "originAccount.holder._id": mongoose.Types.ObjectId(person),
        "originAccount.onModel": "Person",
      });

      orAccount.push({
        "destinationAccount.holder._id": mongoose.Types.ObjectId(person),
        "destinationAccount.onModel": "Person",
      });
    }

    if (typePayment && typeof typePayment === "string") {
      if (typePayment === "APP") {
        matchFilter["payment.typePayment"] = { $in: ["PAGARME", "BRASPAG"] };
      } else {
        matchFilter["payment.typePayment"] = `${typePayment}`;
      }
    }

    if (orAccount && orAccount.length > 0) {
      matchFilter["$or"] = orAccount;
    }

    const list = await BankTransactionsModel.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "account",
          let: { id: "$originAccount" },
          as: "originAccount",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
            {
              $lookup: {
                from: "agency",
                let: { id: "$agency" },
                as: "agency",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$id"] },
                    },
                  },
                  { $limit: 1 },
                ],
              },
            },
            { $unwind: { path: "$agency", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "customer",
                let: { id: "$holder" },
                as: "holderCustomer",
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$id"] } } }, { $limit: 1 }],
              },
            },
            {
              $lookup: {
                from: "company",
                let: { id: "$holder" },
                as: "holderCompany",
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$id"] } } }, { $limit: 1 }],
              },
            },
            {
              $lookup: {
                from: "franchise",
                let: { id: "$holder" },
                as: "holderFranchise",
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$id"] } } }, { $limit: 1 }],
              },
            },
            { $unwind: { path: "$holderCustomer", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$holderCompany", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$holderFranchise", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                status: 1,
                openingBalance: 1,
                limit: 1,
                code: 1,
                bank: 1,
                agency: 1,
                type: 1,
                onModel: 1,
                holder: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: ["$holderCustomer", { $ifNull: ["$holderCustomer", "1"] }],
                        },
                        then: "$holderCustomer",
                      },
                      {
                        case: {
                          $eq: ["$holderCompany", { $ifNull: ["$holderCompany", "1"] }],
                        },
                        then: "$holderCompany",
                      },
                      {
                        case: {
                          $eq: ["$holderFranchise", { $ifNull: ["$holderFranchise", "1"] }],
                        },
                        then: "$holderFranchise",
                      },
                    ],
                    default: null,
                  },
                },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $lookup: {
          from: "agency",
          let: { id: "$originAgency" },
          as: "originAgency",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $lookup: {
          from: "account",
          let: { id: "$destinationAccount" },
          as: "destinationAccount",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
            {
              $lookup: {
                from: "agency",
                let: { id: "$agency" },
                as: "agency",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$id"] },
                    },
                  },
                  { $limit: 1 },
                ],
              },
            },
            { $unwind: { path: "$agency", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "customer",
                let: { id: "$holder" },
                as: "holderCustomer",
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$id"] } } }, { $limit: 1 }],
              },
            },
            {
              $lookup: {
                from: "company",
                let: { id: "$holder" },
                as: "holderCompany",
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$id"] } } }, { $limit: 1 }],
              },
            },
            {
              $lookup: {
                from: "franchise",
                let: { id: "$holder" },
                as: "holderFranchise",
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$id"] } } }, { $limit: 1 }],
              },
            },
            { $unwind: { path: "$holderCustomer", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$holderCompany", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$holderFranchise", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                status: 1,
                openingBalance: 1,
                limit: 1,
                code: 1,
                bank: 1,
                agency: 1,
                type: 1,
                onModel: 1,
                holder: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: ["$holderCustomer", { $ifNull: ["$holderCustomer", "1"] }],
                        },
                        then: "$holderCustomer",
                      },
                      {
                        case: {
                          $eq: ["$holderCompany", { $ifNull: ["$holderCompany", "1"] }],
                        },
                        then: "$holderCompany",
                      },
                      {
                        case: {
                          $eq: ["$holderFranchise", { $ifNull: ["$holderFranchise", "1"] }],
                        },
                        then: "$holderFranchise",
                      },
                    ],
                    default: null,
                  },
                },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $lookup: {
          from: "agency",
          let: { id: "$destinationAgency" },
          as: "destinationAgency",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
            {
              $lookup: {
                from: "franchise",
                let: { id: "$franchise" },
                as: "franchise",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$id"] },
                    },
                  },
                  { $limit: 1 },
                ],
              },
            },
            { $limit: 1 },
            { $unwind: { path: "$franchise", preserveNullAndEmptyArrays: true } },
          ],
        },
      },
      {
        $lookup: {
          from: "payment",
          let: { id: "$payment" },
          as: "payment",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
          ],
        },
      },
      { $unwind: { path: "$originAccount", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$originAgency", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$destinationAccount", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$destinationAgency", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
      {
        $match: matchFilter,
      },
      {
        $sort: { transactionDate: -1 },
      },
      {
        $skip: parseInt(pageIn) * parseInt(pageOut),
      },
      {
        $limit: parseInt(pageOut),
      },
    ]);

    let numTotal = await BankTransactionsModel.find(filter).countDocuments();

    return res.status(200).send({
      list,
      total: numTotal,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Finance/DigitalAccounts/Extract/PaginatorController.js',
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
      message: "Não foi possível listar",
      err: err.message,
    });
  }
};
