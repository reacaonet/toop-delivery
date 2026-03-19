const mongoose = require("mongoose");

const { ConferenceInstance } = require("twilio/lib/rest/api/v2010/account/conference");

/** Model */
const CompanyModel = require("../../../models/Company/CompanyModel");
const SegmentModel = require("../../../models/Company/SegmentModel");
const LogModel = require("../../../models/LogModel");

/** Service */
const getFranchise = require("../../../services/franchise");

const listCategory = async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    const { category } = req.query;

    let filter = {};

    if (!latitude || !longitude) {
      return res.status(400).send({
        message: "Informe sua localização",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng) || typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).send({
        message: "Informe uma localização válida",
      });
    }

    const franchiseId = await getFranchise(lat, lng);

    // console.warn(lat, lng)
    // console.warn('segment franchiseId', franchiseId)

    if (!franchiseId) {
      return res.status(200).send(null);
    }

    filter = {
      franchise: franchiseId,
      status: true,
      deletedAt: { $exists: false },
    };

    if (category && typeof category === "string") {
      if (category === "delivery") {
        filter.category = {
          $ne: "service",
        };
      } else {
        filter.category = `${category}`.toLocaleLowerCase().trim();
      }
    }

    const response = await SegmentModel.aggregate([
      {
        $match: filter,
      },
      {
        $sort: {
          order: 1,
        },
      },
      {
        $project: {
          images: 1,
          name: 1,
          franchise: 1,
          order: 1,
        },
      },
    ]);

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Company/Segment/ListCategory.js',
      error: err?.message,
      method: 'listCategory',
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

    return res.status(200).send({
      message: "Não foi possível retornar lista",
      err: err.message,
    });
  }
};

const listCompanyCategory = async (req, res) => {
  try {
    const { company } = req.params;

    const isCompany = await CompanyModel
      .findById(company)
      .select({
        franchise: 1,
      })
      .lean();

    if (!isCompany) {
      return res.status(200).send(null);
    }

    const response = await SegmentModel.aggregate([
      {
        $match: {
          franchise: isCompany.franchise,
          status: true,
          deletedAt: { $exists: false },
        },
      },
      {
        $project: {
          images: 1,
          name: 1,
          franchise: 1,
        },
      },
    ]);

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Company/Segment/ListCategory.js',
      error: err?.message,
      method: 'listCompanyCategory',
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

    return res.status(200).send({
      message: "Não foi possível retornar lista",
      err: err.message,
    });
  }
};

const franchiseSegment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        message: "Informe uma franquia",
      });
    }

    const response = await SegmentModel.find({ franchise: id }).lean();
    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Company/Segment/ListCategory.js',
      error: err?.message,
      method: 'franchiseSegment',
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
      message: "Não foi possível listar itens",
    });
  }
};

module.exports = {
  listCategory,
  listCompanyCategory,
  franchiseSegment,
};
