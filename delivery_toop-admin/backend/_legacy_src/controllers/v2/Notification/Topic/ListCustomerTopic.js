/** Modules */
const CustomerTopic = require('../../../../models/Notification/CustomerTopic');
const LogModel = require("../../../../models/LogModel");

/**
 * GET
 * /v2/notification-topic/customer
 */

const listCustomerTopic = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const filter = {};

    let pageSize = !limit || limit < 0 ? 20 : limit;
    let pageNum = !page || page <= 0 ? 1 : page;
    skips = pageSize * (pageNum - 1);

    const response = await CustomerTopic.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'notif_topic',
          let: { topics: "$topics" },
          as: 'topics',
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$topics"] }
              }
            },
            {
              $project: {
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
              }
            }
          ],
        }
      },
      {
        $lookup: {
          from: 'customer',
          let: { customer: "$customer" },
          as: 'customer',
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$customer"] }
              }
            },
            {
              $lookup: {
                from: 'person',
                let: { person: "$person" },
                as: 'person',
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$person"] }
                    }
                  },
                  { $project: { name: 1, email: 1, phone: 1 } },
                  { $limit: 1 }
                ],
              }
            },
            { $project: { person: 1 } },
            { $limit: 1 },
            { $unwind: { path: '$person', preserveNullAndEmptyArrays: true } }
          ],
        }
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        }
      },
      { $skip: skips },
      { $limit: pageSize },
    ]);

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Notification/Topic/ListCustomerTopic.js',
      error: err?.message,
      method: 'listCustomerTopic',
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
      message: 'Não foi possível listar',
      err: err.message,
    });
  }
};

module.exports = listCustomerTopic;
