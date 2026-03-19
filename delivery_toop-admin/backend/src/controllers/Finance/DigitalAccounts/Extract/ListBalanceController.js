const mongoose = require("mongoose");

const AccountBalanceModel = require("../../../../models/Finance/DigitalAccounts/AccountBalanceModel");
const BankTransactionsModel = require("../../../../models/Finance/DigitalAccounts/BankTransactionsModel");
const LogModel = require("../../../../models/LogModel");
const AccountModel = require("../../../../models/Finance/DigitalAccounts/AccountModel");
const getAgency = require("./../../../../services/Finance/DigitalAccounts/getAgencyFranchise");
const getAccount = require("./../../../../services/Finance/DigitalAccounts/getAccount");

module.exports = async (req, res) => {
  try {
    const { type, status, startDate, endDate, person, companyFilter, typePayment } = req.query;
    const { tokenUser, isRoot, isCompany, isFranchise, company, companies, franchise } = req;

    let filter = {};

    if (startDate || endDate) {
      if (startDate && endDate) {
        filter.transactionDate = {
          $gte: new Date(`${startDate}T00:00:00Z`),
          $lt: new Date(`${endDate}T23:59:00Z`),
        };
      } else if (startDate && !endDate) {
        filter.transactionDate = {
          $gte: new Date(`${startDate}T00:00:00Z`),
        };
      } else {
        filter.transactionDate = {
          $lt: new Date(`${endDate}T23:59:00Z`),
        };
      }
    }

    if (typePayment && typePayment !== "all") filter = { ...filter, "payment.typePayment": typePayment };

    if (isFranchise) {
      const agency = await getAgency(franchise, true);

      filter = {
        ...filter,
        $and: [
          {
            $or: [{ originAgency: mongoose.Types.ObjectId(agency._id) }, { destinationAgency: mongoose.Types.ObjectId(agency._id) }],
          },
        ],
      };
    } else if (isRoot) {
      const agency = await getAgency(null, false);

      filter = {
        ...filter,
        // $and: [
        //   {
        //     $or: [{ originAgency: mongoose.Types.ObjectId(agency._id) }, { destinationAgency: mongoose.Types.ObjectId(agency._id) }],
        //   },
        // ],
      };
    } else {
      const account = await getAccount(company, "Company", franchise);

      console.log(account);

      filter = {
        ...filter,
        $and: [
          {
            $or: [{ originAccount: mongoose.Types.ObjectId(account._id) }, { destinationAccount: mongoose.Types.ObjectId(account._id) }],
          },
        ],
      };
    }

    let balance = await BankTransactionsModel.aggregate([
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
      {
        $unwind: { path: "$payment", preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          status: "COMPLETED",
          ...filter,
        },
      },
      {
        $group: {
          _id: 1,
          input: {
            $sum: { $cond: { if: { $eq: ["$type", "credit"] }, then: "$value", else: 0 } },
          },
          output: {
            $sum: { $cond: { if: { $eq: ["$type", "debit"] }, then: "$value", else: 0 } },
          },
        },
      },
    ]);

    if (balance.length <= 0) balance = [{ balance: 0, input: 0, output: 0 }];

    return res.status(200).send({ ...balance[0], balance: balance[0].input - balance[0].output });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Finance/DigitalAccounts/Extract/ListBalanceController.js',
      error: err?.message,
      method: 'ListBalanceController',
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

    console.log("Fail in query balance", err);
    return;
  }
};
