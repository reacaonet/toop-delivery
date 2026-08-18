// import { Types } from 'mongoose';
const mongoose = require("mongoose");

const PushNotificationModel = require('../../../models/Mobility/Notification/PushNotificationModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (request, res) => {
  try {
    const { pageIn, pageOut, topic, franchise } = request.query;

    const {
      isFranchise,
      franchise: loggedFranchise,
    } = request;

    const filter = {};

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: 'Dados da paginação inválidos',
      });
    }

    if (isFranchise) {
      filter.franchise = new mongoose.Types.ObjectId(loggedFranchise);
    }

    // --> name filter
    if (topic) {
      filter.topic = topic;
    }

    // --> franchise filter
    if (franchise) {
      filter.franchise = new mongoose.Types.ObjectId(franchise);
    }

    const list = await PushNotificationModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'franchise',
          localField: 'franchise',
          foreignField: '_id',
          as: 'franchise',
        },
      },
      {
        $unwind: { path: '$franchise', preserveNullAndEmptyArrays: true },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      { $limit: parseInt(pageOut, 10) },
      { $skip: parseInt(pageIn, 10) * parseInt(pageOut, 10) },
    ]);

    const numTotal = await PushNotificationModel.find(filter).countDocuments();

    return res.status(200).send({ list, total: numTotal });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/PushNotification/PaginatorController.js',
      error: err?.message,
      method: 'PaginatorController',
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

    return res.status(400).send({
      message: 'Falha ao encontrar registros para Paginação',
      err: err.message,
    });
  }
};
