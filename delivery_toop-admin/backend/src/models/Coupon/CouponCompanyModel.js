const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    companies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Company',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "CompanyCoupon",
  }
);

schema.index({companies:  -1});
schema.index({coupon:  -1});

module.exports = mongoose.model("CompanyCoupon", schema, "company_coupon");
