const mongoose = require("mongoose");

/** Model */
const PreRegistration = require("../../../models/PreRegistration/PreRegistrationModel");
const DynamicPreRegisterModel = require("../../../models/PreRegistration/DynamicPreRegisterModel");
const Franchise = require("../../../models/Franchise/FranchiseModel");
const LogModel = require("../../../models/LogModel");

const listViewController = async (request, reply) => {
  try {
    const { ddi = "+55", phone, id } = request.query;
    const filter = {};

    if (id) {
      filter._id = id;
    }

    if (ddi && phone) {
      filter.ddi = `${ddi}`.trim();
      filter.phone = `${phone}`.trim();
    }

    if (Object.keys(filter).length === 0) {
      return reply.status(401).send({
        message: "Informe um filtro",
      });
    }

    filter.status = { $ne: "APPROVED" };
    filter.deletedAt = { $exists: false };

    const preRegister = await PreRegistration.findOne(filter)
      .sort({
        createdAt: -1,
      })
      .lean();

    const filterD = {};

    if (preRegister?.country) {
      filterD.country = preRegister?.country;
    }

    if (preRegister?.viewNextRegister) {
      filterD.view = preRegister?.viewNextRegister;
    } else {
      filterD.view = "country";
      delete filterD.country;
    }

    const respViews = await DynamicPreRegisterModel.find(filterD).lean();

    // console.log('respViews', respViews);

    const view = [];
    let footer = null;

    for await (const item of respViews) {
      if (item.uploadDocPhoto) {
        view.push({
          view: item.view,
          nextView: item.nextView,
          country: item?.country || "",
          uploadDocPhoto: item.uploadDocPhoto,
          ...item.uploadDocPhotoPayload,
          _id: item._id,
        });
      } else if (item.inputType) {
        // Verificar regra na top
        if (item.inputType === "list" && item?.listPopulate === "getFranchise") {
          item.inputTypePayload.list = await getFranchise(item.country);
        }

        view.push({
          view: item.view,
          nextView: item.nextView,
          country: item?.country || "",
          inputType: item.inputType,
          inputGroup: item.inputGroup,
          mask: item?.mask || null,
          ...item.inputTypePayload,
          _id: item._id,
        });

        if (item.footer) {
          footer = item.footer;
        }
      }
    }

    return reply.send({
      user: preRegister,
      view: view,
      footer,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/PreRegistration/dynamic/ListViewController.js',
      error: err?.message,
      method: 'listViewController',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: request?.application,
        franchise: request?.franchise,
        company: request?.company,
        params: request?.params,
        body: request?.body,
        query: request?.query,
        heders: request?.heders,
        method: request?.method,
        url: request?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    return reply.status(400).send({
      message: "Não foi possível listar view atual",
      err: err.message,
    });
  }
};

const getFranchise = async country => {
  try {
    const response = [];
    const strCountry = country.toUpperCase().trim();

    const franchies = await Franchise.aggregate([
      {
        $match: {
          status: true,
          deletedAt: {
            $exists: false,
          },
        },
      },
      {
        $project: {
          city: 1,
          state: 1,
        },
      },
      {
        $lookup: {
          from: "settingState",
          let: { stateId: "$state" },
          as: "state",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$stateId"] },
              },
            },
            {
              $project: {
                country: 1,
                uf: 1,
                name: 1,
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $unwind: { path: "$state", preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          "state.country": { $eq: strCountry },
        },
      },
      {
        $lookup: {
          from: "settingCity",
          let: { cityId: "$city" },
          as: "city",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$cityId"] },
                deletedAt: { $exists: false },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $unwind: { path: "$city", preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          "city._id": { $exists: true },
        },
      },
    ]);

    for (let i = 0; i < franchies.length; i++) {
      response.push({
        _id: franchies[i]._id,
        franchise: franchies[i]._id.toHexString(),
        title: `${franchies[i]?.city?.name}/${franchies[i]?.state?.uf}`,
      });
    }

    return response;
  } catch (err) {
    return [];
  }
};

module.exports = listViewController;
