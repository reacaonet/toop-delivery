const moment = require('moment');
const { Types } = require('mongoose');

const Payment = require('../../../models/Shopping/PaymentModel');
const OrderStatusModel = require('../../../models/Shopping/order/orderStatusModel');
const paymentApi = require('../../../services/paymentApi');

const listInvoice = async(req, res) => {
  const { data: invoices } = await paymentApi.get('/invoice');

  const company = {
    from: "company",
    localField: "company",
    foreignField: "_id",
    as: "company",
  };

  const customer = {
    from: "customer",
    localField: "customer",
    foreignField: "_id",
    as: "customer",
  };

  const person = {
    from: "person",
    localField: "customer.person",
    foreignField: "_id",
    as: "customer.person",
  };

  const payment = await Payment.aggregate([
    { $lookup: company },
    { $lookup: customer },
    { $lookup: person },
    { $unwind: "$company" },
    { $unwind: "$customer" },
    {
      $group: {
        _id: {
          month: {
            $month: "$createdAt"
          },
          day: {
            $dayOfMonth: "$createdAt"
          },
          year: {
            $year: "$createdAt"
          },
          company: {
            _id: "$company._id",
            name: "$company.name",
          }
        },
        payments: {
          $push: "$$ROOT"
        },
        creditPrice: {
          $sum: "$totalCompany"
        },
        debitPrice: {
          $sum: "$debitPrice"
        },
      }
    },
    {
      $sort: {
        _id: -1,
      }
    }
  ]);

  for (const listPayment of payment) {
    for (const payments of listPayment.payments) {

      for (const invoice of invoices.response) {
        if (payments.shoppingCart === invoice.shoppingCart) {
          payments.invoice = invoice;
        } else {
          payments.invoice = invoice;
        }
      }
      const order = await OrderStatusModel.findOne({
        shoppingCart: payments.shoppingCart
      })

      if (order) {
        payments.order = order;
      }
    }
  }

  res.status(200).send(payment);
};

module.exports = listInvoice;
