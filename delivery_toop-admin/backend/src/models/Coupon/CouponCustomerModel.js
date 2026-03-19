const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    company: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    person: {
      type: mongoose.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    orderStatus: {
      type: mongoose.Types.ObjectId,
      ref: "OrderStatus",
      required: true,
    },
    payment: {
      type: mongoose.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    customer: {
      type: mongoose.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "CouponCustomer",
  }
);

schema.index({coupon: -1});
schema.index({company: -1});
schema.index({person: -1});
schema.index({customer: -1});

module.exports = mongoose.model("CouponCustomer", schema, "coupon_customer");
