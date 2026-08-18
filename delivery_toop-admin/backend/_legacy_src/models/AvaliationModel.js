const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    typeEvaluator: {
      type: String,
      enum: ['Shopper', 'Customer', 'DeliveryMan'],
      required: true
    },
    typeRated: {
      type: String,
      enum: ['Shopper', 'Customer', 'DeliveryMan'],
      required: true
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payments",
      required: true,
    },
    idEvaluator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    idRated: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderStatus",
      required: true
    },
    starts: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true
    },
    description: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
    collection: "avaliation",
  }
);

module.exports = mongoose.model("Avaliation", schema, "avaliation");
