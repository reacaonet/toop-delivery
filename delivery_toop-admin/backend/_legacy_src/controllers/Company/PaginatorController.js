const mongoose = require("mongoose");

const Company = require("../../models/Company/CompanyModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, group, name, company } = req.query;
    const { tokenUser, company: companayDefault, companies, isFranchise, isRoot } = req;

    let filter = {};
    let list;
    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    if (company && mongoose.Types.ObjectId.isValid(company)) {
      filter._id = mongoose.Types.ObjectId(company);
    } else {
      // restringe os dados a nivel da franquia
      if (isFranchise || isRoot) {
        filter._id = { $in: companies };
      } else {
        filter._id = { $in: companayDefault ? [companayDefault] : companies };
      }
    }

    if (group && mongoose.Types.ObjectId.isValid(group)) {
      filter.groups = mongoose.Types.ObjectId(group);
    }

    if (name && typeof name === "string" && name.trim().length > 0) {
      filter.name = { $regex: ".*" + name.toLowerCase() + ".*", $options: "i" };
    }

    filter.deletedAt = {
      $exists: false,
    };

    list = await Company.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "settingBrazilianBanks",
          localField: "bankData.brazilianBank",
          foreignField: "_id",
          as: "bankData.brazilianBank",
        },
      },
      {
        $unwind: { path: "$bankData.brazilianBank", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "group",
          let: { id: "$groups" },
          as: "groups",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
                deletedAt: { $exists: false },
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $lookup: {
          from: "company_delivery",
          let: { id: "$companyDelivery" },
          as: "companyDelivery",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
                deletedAt: { $exists: false },
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $unwind: { path: "$companyDelivery", preserveNullAndEmptyArrays: true },
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
                deletedAt: { $exists: false },
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $lookup: {
          from: "companySegment",
          let: { id: "$segment" },
          as: "segment",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
                deletedAt: { $exists: false },
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          type: 1,
          shoppingFlow: 1,
          images: 1,
          imageAppHeader: 1,
          cnpj: 1,
          name: 1,
          description: 1,
          status: 1,
          lat: 1,
          lng: 1,
          location: 1,
          address: 1,
          complement: 1,
          phone: 1,
          category: 1,
          keywords: 1,
          approved: 1,
          isHighlighted: 1,
          companyDelivery: 1,
          bankData: 1,
          recipient_id: 1,
          pagar_me_bank_id: 1,
          socialNetwork: {
            whatsapp: { $substr: ["$socialNetwork.whatsapp", 3, 25] },
            instagram: 1,
            facebook: 1,
          },
          groups: {
            $arrayElemAt: ["$groups", 0],
          },
          franchise: {
            $arrayElemAt: ["$franchise", 0],
          },
          segment: {
            $arrayElemAt: ["$segment", 0],
          },
          companyCategory: 1,
        },
      },
      {
        $sort: {
          name: 1,
          approved: -1,
        },
      },
      { $skip: parseInt(pageIn) * parseInt(pageOut) },
      { $limit: parseInt(pageOut) },
    ]);

    let numTotal = await Company.find(filter).countDocuments();
    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Company/PaginatorController.js',
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
