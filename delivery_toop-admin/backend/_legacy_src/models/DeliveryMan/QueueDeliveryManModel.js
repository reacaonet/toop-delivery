const mongoose = require("mongoose");
const PointSchema = require("./../utils/PointSchema");
const TypeOfVehicle = require("./../utils/typeOfVehicle");

const schema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderStatus",
      required: true,
      unique: true,
    },
    locationCompany: {
      type: PointSchema,
      index: "2dsphere",
      required: true,
    },
    attempt: {
      type: Number,
      default: 0,
      required: true,
    },
    deliveryMan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryMan",
      required: false,
    },
    lastData: {
      type: Date,
      required: false,
    },
    historicDeliveryMan: {
      type: Array,
      default: [],
      required: true,
    },
    deliveryManProcess: {
      type: Array,
      default: [],
      required: true,
    },
    status: {
      type: String,
      enum: ["WAIT", "PROCESS", "FINISH", "NOT_FOUND_DELIVERYMAN"],
      default: "WAIT",
      required: true,
    },
    statusProcess: {
      type: String,
      enum: ["IN_QUEUE", "FINISH"],
      required: false,
    },
    sendToDeliveryMan: {
      type: String,
      ref: "DeliveryMan",
      required: false,
    },
    sendToListDeliveryMan: {
      // entregadores associados a empresa, somente eles podem receber corridas,
      type: [mongoose.Schema.Types.ObjectId],
      ref: "DeliveryMan",
      required: false,
    },
    typeOfVehicle: {
      type: String,
      enum: TypeOfVehicle,
      required: false,
    },
    notificationReceived: {
      type: Array,
      default: [],
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "queueDeliveryMan",
  },
);

schema.index({ attempt: 1 });
schema.index({ lastData: 1 });
schema.index({ status: 1 });
schema.index({ order: -1 });

module.exports = mongoose.model("QueueDeliveryMan", schema, "queueDeliveryMan");

/**
 * sendToDeliveryMan -> Utilizado quando quer que este pedido vá apenas para este entregador
 */
