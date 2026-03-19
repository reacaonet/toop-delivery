const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    orderStatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderStatus",
      required: true,
    },
    deliveryMan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryMan",
      required: true,
    },
    tip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tip",
      required: false,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "tipDeliveryMan",
  }
);

module.exports = mongoose.model("TipDeliveryMan", schema, "tipDeliveryMan");
