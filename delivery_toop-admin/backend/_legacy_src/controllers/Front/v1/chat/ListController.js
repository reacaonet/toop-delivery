const mongoose = require('mongoose');
const ChatMessage = require('../../../../models/chatMessageModel');
const LogModel = require("../../../../models/LogModel");

/**
 * GET
 * url - /v1/front/chat/:cartId
*/
const list = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId || !mongoose.isValidObjectId(cartId)) {
      return res.status(400).send({
        message: 'Inform one cart valid'
      });
    }

    // let messages = await ChatMessage.find({shoppingCart: cartId});

    let messages = await ChatMessage.aggregate([
      { $match: { shoppingCart: mongoose.Types.ObjectId(cartId) } },
      {
        $project: {
          type: 1,
          read: 1,
          readSend: 1,
          message: 1,
          personId: 1,
          person: 1,
          personSendId: 1,
          order_number: 1,
          personSend: 1,
          createdAt: 1,
          updatedAt: 1,
          customer: {
            $cond: {
              if: { $eq: ["$person", 'customer'] }, then: "$personId", else: {
                $cond: {
                  if: { $eq: ["$personSend", 'customer'] }, then: "$personSendId", else: null
                }
              }
            },
          },
          shopper: {
            $cond: {
              if: { $eq: ["$person", 'shopper'] }, then: "$personId", else: {
                $cond: {
                  if: { $eq: ["$personSend", 'shopper'] }, then: "$personSendId", else: null
                }
              }
            },
          },
          deliveryMan: {
            $cond: {
              if: { $eq: ["$person", 'deliveryMan'] }, then: "$personId", else: {
                $cond: {
                  if: { $eq: ["$personSend", 'deliveryMan'] }, then: "$personSendId", else: null
                }
              }
            },
          },
        },
      },
      {
        $lookup: {
          from: "customer",
          let: { customerId: "$customer" },
          as: "customer",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$customerId"] } },
            },
            { $limit: 1 },
            { $project: { email: 1, person: 1 } }
          ],
        }
      },
      { $unwind: { path: "$shopper", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          let: { id: "$shopper" },
          as: "shopper",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$id"] } },
            },
            { $limit: 1 },
            { $project: { name: 1, email: 1 } }
          ],
        }
      },
      { $unwind: { path: "$shopper", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          let: { id: "$deliveryMan" },
          as: "deliveryMan",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$id"] } },
            },
            { $limit: 1 },
            { $project: { name: 1, email: 1 } }
          ],
        }
      },
      { $unwind: { path: "$deliveryMan", preserveNullAndEmptyArrays: true } },
      {
        $sort: { createdAt: 1 }
      }
    ]);


    return res.status(200).send(messages);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Front/v1/chat/ListController.js',
      error: err?.message,
      method: 'list',
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
      message: 'Fail list order',
      err: err.message,
    });
  }
};

module.exports = list;
