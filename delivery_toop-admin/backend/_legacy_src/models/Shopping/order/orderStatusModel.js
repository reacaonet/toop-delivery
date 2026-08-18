const mongoose = require("mongoose");
const TypeOfVehicle = require("../../utils/typeOfVehicle");

const schema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "WAIT_COMPANY",
        "ACCEPT_SHOPPER",
        "IN_PREPARATION",
        "FINISH_PREPARATION",
        "PAYMENT_REQUEST",
        "WAIT_DELIVERYMAN",
        "ACCEPT_DELIVERYMAN",
        "MARKET_CASHIER",
        "IN_PROGRESS_DELIVERYMAN",
        "RELEASE_SHOPPER",
        "DISPATCH", // Entregador próprio
        "DELIVERY_ROUTE",
        "FINISHED",
        "CANCELED",
      ],
      default: "WAIT_COMPANY",
      required: true,
    },
    order_number: {
      type: Number,
      required: true,
      unique: false,
    },
    note: {
      type: String,
      required: false,
    },
    payment: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Payments",
      required: true,
    },
    transactionCode: {
      type: String,
      required: false,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    shoppingCart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShoppingCart",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerDelivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerDeliveryAddress",
      required: true,
    },
    companyDelivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyDelivery",
      required: false,
      //required: true,
    },
    shopper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: false,
    },
    acceptedDateShopper: {
      type: Date,
      required: false,
    },
    deliveryMan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryMan",
      required: false,
    },
    acceptedDateDeliveryMan: {
      type: Date,
      required: false,
    },
    finishDateDeliveryMan: {
      type: Date,
      required: false,
    },
    typePayment: {
      type: String,
      enum: ["MONEY", "CARD", "BRASPAG", "PAGARME", "PIX", "PIX_DIRECT", "IUGU"],
      required: true,
      default: "BRASPAG",
    },
    typeSchedule: {
      type: String,
      enum: ["DELIVERY", "WITHDRAWAL"],
      required: false,
    },
    shoppingPaymentMethod: {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: "ShoppingPaymentMethod",
    },
    cashBackProcess: {
      type: Boolean,
      required: true,
      default: false,
    },
    typeOfVehicle: {
      type: String,
      enum: TypeOfVehicle,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    singleDelivery: {
      // Identifica Entrega Avulsa
      type: Boolean,
      default: false,
      required: false,
    },

    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "orderStatus",
  },
);

schema.index({ status: -1 });
schema.index({ shoppingCart: -1 });
schema.index({ customer: -1 });
schema.index({ note: -1 });
schema.index({ customerDelivery: -1 });
schema.index({ companyDelivery: -1 });
schema.index({ shopper: -1 });
schema.index({ deliveryMan: -1 });
schema.index({ typePayment: -1 });
schema.index({ typeSchedule: -1 });
schema.index({ company: -1 });
schema.index({ franchise: -1 });
schema.index({ payment: -1 });
schema.index({ order_number: -1 });
schema.index({ shoppingPaymentMethod: -1 });
schema.index({ createdAt: -1 });

module.exports = mongoose.model("OrderStatus", schema, "orderStatus");
