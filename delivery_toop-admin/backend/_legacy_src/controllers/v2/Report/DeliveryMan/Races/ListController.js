/* LIBS */
const mongoose = require('mongoose');
const moment = require('moment')

/* Model */
const OrderStatus = require('../../../../../models/Shopping/order/orderStatusModel');
const LogModel = require('../../../../../models/LogModel');

/**
 * GET
 * Url - /v2/report/deliveryman/races
 * Params
 * deliveryman (Optional || ObjectId )
 * date (Required || date || yyyy-mm-dd )
 */
const list = async (req, res) => {
  try {
    const { deliveryman_id } = req.params;
    const { date, dateFinal, timezone, zone } = req.query;
    let timeZone = 'America/Sao_Paulo'
    let zoneH = -3

    match = {};

    //verifica se existe dados para paginação
    if (date == '' || !date) {
      return res.status(400).send({
        message: 'Dados da paginação inválidos',
        Error: 'date not found',
      });
    }

    //verifica se existe o _id do entregador
    if (deliveryman_id && mongoose.Types.ObjectId.isValid(deliveryman_id)) {
      match.deliveryMan = mongoose.Types.ObjectId(deliveryman_id);
    }

    if (timezone && zone) {
      timeZone = timezone
      zoneH = zone
    }

    const payment = {
      from: 'payment',
      localField: 'payment',
      foreignField: '_id',
      as: 'payment',
    };

    const company = {
      from: 'company',
      localField: 'company',
      foreignField: '_id',
      as: 'company',
    };

    const deliveryMan = {
      from: 'deliveryMan',
      localField: 'deliveryMan',
      foreignField: '_id',
      as: 'deliveryMan',
    };

    const customerDelivery = {
      from: 'customer_delivery_address',
      localField: 'customerDelivery',
      foreignField: '_id',
      as: 'customerDelivery',
    };

    if (date && dateFinal) {
      match['$and'] = [
        {
          createdAt: { $gte: moment(`${date} 00:00:00`).utcOffset(zoneH, true).toDate() }
        },
        {
          createdAt: { $lte: moment(`${dateFinal} 23:59:59`).utcOffset(zoneH, true).toDate() }
        }
      ]
    } else {
      match['$expr'] = {
        $eq: [
          date,
          {
            $dateToString: {
              date: '$createdAt',
              format: '%Y-%m-%d',
            },
          },
        ],
      };
    }

    match.status = { $in: ['DELIVERY_ROUTE', 'ACCEPT_DELIVERYMAN', 'FINISHED'] };


    const sumTipCond = {
      $cond: {
        if: { $gte: ["$deliveryMan.deliveryFee.percentage", 0] },
        then: {
          $multiply: [
            {
              $divide: ['$payment.valueTip', 100]
            },
            '$deliveryMan.deliveryFee.percentage'
          ]
        },
        else: '$payment.valueTip'
      }
    }

    //consulta os pedidos aceitos ou finalizados pelo entregador
    let orders = await OrderStatus.aggregate([
      {
        $match: match,
      },
      {
        $sort: {
          acceptedDateDeliveryMan: -1,
        },
      },
      {
        $lookup: payment,
      },
      {
        $lookup: company,
      },
      {
        $lookup: deliveryMan,
      },
      {
        $lookup: customerDelivery,
      },
      {
        $unwind: {
          path: '$payment',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$company',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$deliveryMan',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$customerDelivery',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$acceptedDateDeliveryMan',
              timezone: timeZone,
            },
          },
          totalValueForThisDay: {
            $sum: {
              $cond: {
                if: { $gte: ["$deliveryManPercentage", 0] },
                then: {
                  $sum: [
                    {
                      $multiply: [
                        {
                          $divide: ['$payment.priceDelivery', 100]
                        },
                        '$deliveryManPercentage'
                      ]
                    },
                    sumTipCond
                  ]
                },
                else: {
                  $cond: {
                    if: { $gte: ["$deliveryMan.deliveryFee.percentage", 0] },
                    then: {
                      $sum: [
                        {
                          $multiply: [
                            {
                              $divide: ['$payment.priceDelivery', 100]
                            },
                            '$deliveryMan.deliveryFee.percentage'
                          ]
                        },
                        sumTipCond
                      ]
                    },
                    else: {
                      $sum: [
                        '$payment.priceDelivery',
                        sumTipCond
                      ]
                    }
                  }
                }
              }
            },
          },
          rides: {
            $push: {
              _id: '$_id',
              hour: {
                $dateToString: {
                  format: '%H:%M',
                  date: '$acceptedDateDeliveryMan',
                  timezone: timeZone
                }
              },
              value: {
                $sum: [
                  {
                    $cond: {
                      if: { $gte: ["$deliveryManPercentage", 0] },
                      then: {
                        $multiply: [
                          {
                            $divide: ['$payment.priceDelivery', 100]
                          },
                          '$deliveryManPercentage'
                        ]
                      },
                      else: {
                        $cond: {
                          if: { $gte: ["$deliveryMan.deliveryFee.percentage", 0] },
                          then: {
                            $multiply: [
                              {
                                $divide: ['$payment.priceDelivery', 100]
                              },
                              '$deliveryMan.deliveryFee.percentage'
                            ]
                          },
                          else: '$payment.priceDelivery'
                        }
                      }
                    }
                  },
                  sumTipCond
                ]
              },
              valueTip: '$payment.valueTip',
              acceptedDateDeliveryMan: '$acceptedDateDeliveryMan',
              deliveryManPercentage: '$deliveryManPercentage',
              typePayment: '$typePayment',
              origin: '$company.address',
              destiny: '$customerDelivery.address',
            },
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $addFields: {
          date: {
            $dateToString: {
              format: '%d/%m/%Y',
              date: {
                $dateFromString: {
                  dateString: "$_id",
                  format: "%Y-%m-%d",
                }
              }
            }
          }
        },
      },
    ]);

    return res.status(200).send(orders);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Report/DeliveryMan/Races/ListController.js',
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
      message: 'Não foi possível listar dados das corridas',
      err: err.message,
    });
  }
};

module.exports = list;
