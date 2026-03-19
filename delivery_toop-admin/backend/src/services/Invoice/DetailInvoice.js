const mongoose = require('mongoose');
const paymentApi = require('../paymentApi');
const Order = require('../../models/Shopping/order/orderStatusModel');

const DetailInvoice = async (id) => {
  try {
    let response = {};
    const {data: invoice} = await paymentApi.get(`/invoice/${id}`);


    const result = await Order.aggregate([
      {
        $match : { _id: mongoose.Types.ObjectId(invoice.order)}
      },
      {
        $lookup: {
          from: "payment",
          let: { paymentId: "$payment" },
          as: "payment",
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$paymentId"] }} },
            {
              $project: {
                capture: 1, coupon: 1, couponPrice: 1,
                total: 1, totalCompany: 1, priceDelivery: 1,
                serviceCharge: 1, statusPayload: 1
              },
            },
            {$limit: 1}
          ],
        },
      },
      { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "customer",
          let: { customerId: "$customer" },
          as: "customer",
          pipeline: [
            { $match: {$expr: { $eq: ["$_id", "$$customerId"]}}},
            { $project: { person: 1 } },
            {
              $lookup: {
                from: "person",
                let: { personId: "$person" },
                as: "person",
                pipeline: [
                  { $match: {$expr: { $eq: ["$_id", "$$personId"]}}},
                  { $project: {
                    name: 1,
                    email: 1,
                    phone: 1,
                  }},
                  {$limit: 1}
                ]
              }
            },
            { $unwind: { path: "$person", preserveNullAndEmptyArrays: true } },
            {$limit: 1},
          ]
        }
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      // {
      //   $lookup: {
      //     from: 'shoppingCartItem',
      //     let: { cartId: "$shoppingCart" },
      //     as: "cartItens",
      //     pipeline: [
      //       {
      //         $match: { $expr: { $eq: ['$shoppingCart', '$$cartId']}}
      //       }
      //     ],
      //   },
      // },
      {
        $project: {
          status: 1,
          order_number: 1,
          customer: 1,
          payment: 1,
          cartItens: 1,
          typePayment: 1,
        }
      },
      { $limit: 1}
    ]);

    if (result && result.length > 0) {
      response.invoice = invoice;
      response.order = result[0]
    }

    return response;
  } catch (err) {
    let error = err.message;
    if (err.response && err.response.data) {
      error = err.response.data
    }

    return {
      status: false,
      err: error
    };
  }
};


module.exports = DetailInvoice;
