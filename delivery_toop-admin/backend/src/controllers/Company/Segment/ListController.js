/** Lib */
const mongoose = require("mongoose");

/* Model */
const CompanyModel = require("../../../models/Company/CompanyModel");
const SegmentModel = require('../../../models/Company/SegmentModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    let {
      companyId,
      name,
      status,
    } = req.query;
    const { franchise, franchises = [] } = req;

    const filter = {};

    filter.deletedAt = {
      $exists: false,
    };

    // restringe os dados a nivel da franquia
    filter.franchise = { $in: franchise ? [franchise] : [...franchises] };

    if (companyId && mongoose.isValidObjectId(companyId)) {
      const isCompany = await CompanyModel
      .findById(companyId)
      .select({
        franchise: 1,
      })
      .lean();

      if (!isCompany || !isCompany?.franchise) {
        return res.status(200).send({
          message: 'Empresa não encontrada ou não vinculada a uma Franquia'
        });
      }

      filter.franchise = mongoose.Types.ObjectId(isCompany?.franchise);
    }

    if (name) {
      const decodeName = decodeURIComponent(name);
      filter.name = {
        $regex: ".*" + decodeName.toLowerCase() + ".*",
        $options: "i",
      };
    }

    if (`${status}` === "false" || `${status}` === "true") {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== "all") {
      filter.status = { $eq: true };
    }

    const list = await SegmentModel.find(filter).lean();

    return res.status(200).send(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Company/Segment/ListController.js',
      error: err?.message,
      method: 'ListController',
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
      message: "Falha ao encontrar Slider",
      Error: err.message,
    });
  }
};
