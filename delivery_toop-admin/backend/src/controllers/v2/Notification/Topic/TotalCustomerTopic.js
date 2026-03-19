const mongoose = require('mongoose');

/** Modules */
const Topics = require('../../../../models/Notification/TopicModel');
const LogModel = require("../../../../models/LogModel");

/**
 * GET
 * /v2/notification-topic/customer/total
 */
const totalCustomerTopic = async (req, res) => {
  try {

    const response = await Topics.aggregate([
      { $match: {} },
      {
        $project: {
          _id: 1,
          name: 1,
          topic: 1,
        }
      },
      {
        $lookup: {
          from: 'notif_customer',
          let: { id: "$_id" },
          as: 'total',
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$$id", "$topics"] }
              }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              },
            },
            {
              $project: {
                _id: 0,
                count: 1,
              },
            }
          ],
        },
      },
      { $unwind: { path: '$total', preserveNullAndEmptyArrays: true } },
    ]);

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Notification/Topic/TotalCustomerTopic.js',
      error: err?.message,
      method: 'totalCustomerTopic',
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
      message: 'Não foi possível retornar o total',
      err: err.message,
    });
  }
};

module.exports = totalCustomerTopic;
