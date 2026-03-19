const mongoose = require('mongoose');

const paymentApi = require('../paymentApi');
const Order = require('../../models/Shopping/order/orderStatusModel');

const Invoices = async (filter = {}) => {
  try {
    let response = {};
    let queryString = Object.keys(filter).map((key) => `${key}=${filter[key]}`).join('&');

    const {data: invoices} = await paymentApi.get(`/invoice?${queryString}`);

    if (!invoices || !invoices.response || invoices.response.length <= 0) {
      return invoices;
    }

    response.response = [];

    for await (const invoice of invoices.response) {
      const result = await Order.aggregate([
        {
          $match : { _id: mongoose.Types.ObjectId(invoice.order) }
        },
        {
          $lookup: {
            from: "payment",
            let: { paymentId: "$payment" },
            as: "payment",
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$paymentId"] },
                }
              },
              {
                $project: {
                  coupon: 1,
                  couponPrice: 1,
                  total: 1,
                  totalCompany: 1,
                  priceDelivery: 1,
                  serviceCharge: 1,
                  statusPayload: 1,
                  priceFreight: 1,
                  paymentProviderId: 1,
                },
              },
              {$limit: 1}
            ],
          },
        },
        { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            status: 1,
            order_number: 1,
            typePayment: 1,
            payment: 1,
            createdAt: 1,
            ownerCompany: {
              $cond: {
                if: {$ne: [invoice.ownerCompany, null]}, then: mongoose.Types.ObjectId(invoice.ownerCompany), else: null
              }
            },
            company: {
              $cond: {
                if: {$ne: [invoice.company, null]}, then: mongoose.Types.ObjectId(invoice.company), else: null
              }
            },
            ownerPerson: {
              $cond: {
                if: {$ne: [invoice.ownerPerson, null]}, then: mongoose.Types.ObjectId(invoice.ownerPerson), else: null
              }
            },
            person: {
              $cond: {
                if: {$ne: [invoice.person, null]}, then: mongoose.Types.ObjectId(invoice.person), else: null
              }
            },
          }
        },
        {
          $lookup: {
            from: "company",
            let: { ownerCompany: "$ownerCompany"},
            as: "ownerCompany",
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$ownerCompany"] },
                },
              },
              { $project: { name: 1 } },
              { $limit: 1}
            ],
          }
        },
        { $unwind: { path: "$ownerCompany", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "company",
            let: { companyId: "$company"},
            as: "company",
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$companyId"] },
                },
              },
              { $project: { name: 1 } },
              { $limit: 1}
            ],
          }
        },
        { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "person",
            let: { id: "$ownerPerson"},
            as: "ownerPerson",
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id"] },
                },
              },
              { $project: { name: 1 } },
              { $limit: 1}
            ],
          }
        },
        { $unwind: { path: "$ownerPerson", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "person",
            let: { id: "$person"},
            as: "person",
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id"] },
                },
              },
              { $project: { name: 1 } },
              { $limit: 1}
            ],
          }
        },
        { $unwind: { path: "$person", preserveNullAndEmptyArrays: true } },
        { $limit: 1 }
      ]);

      if (result) {
        response.response.push({
          invoice: invoice,
          order: result[0],
        });
      }
    }

    response.page = invoices.page;
    response.pageLimit = invoices.pageLimit;
    response.total = invoices.total;

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

module.exports = Invoices;
