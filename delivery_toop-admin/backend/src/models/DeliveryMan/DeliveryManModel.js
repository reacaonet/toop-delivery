const mongoose = require("mongoose");
const PointSchema = require("./../utils/PointSchema");
const DeliveryFee = require("./util/DeliveryFee");
const BankShema = require("./../utils/BankData");
const TypeOfVehicle = require("./../utils/typeOfVehicle");

const schema = new mongoose.Schema(
  {
    isOnline: {
      type: Boolean,
      default: false,
      required: true,
    },
    phone: {
      type: Number,
      required: false,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: false,
    },
    companyService: {
      // Empresas em que o entregador presta serviços ao solicitar entrega
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Company",
      required: false,
    },
    typeOfVehicle: {
      type: String,
      enum: TypeOfVehicle,
      default: "MOTO",
      required: false,
    },
    board: {
      type: String,
      required: false,
    },
    device: {
      type: String,
      required: false,
    },
    token: {
      type: String,
      required: false,
    },
    model: {
      type: String,
      required: false,
    },
    manufacturer: {
      type: String,
      required: false,
    },
    color: {
      type: String,
      required: false,
    },
    year: {
      type: Number,
      required: false,
    },
    showFreightValue: {
      type: Boolean,
      required: true,
      default: false,
    },
    merchantId: {
      type: String,
      required: false,
    },
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    racecanceled: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RaceCanceled",
      required: false,
    },
    location: {
      type: PointSchema,
      index: "2dsphere",
      required: false,
    },
    updatedLastLocation: {
      type: Date,
      required: false,
    },
    flag: {
      type: String,
      enum: ["FREE", "ON_ROUTE", "UNAVAILABLE"],
      default: "FREE",
      required: true,
    },
    queueDeliveryMan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QueueDeliveryMan",
      required: false,
    },
    deliveryFee: {
      type: DeliveryFee,
      required: false,
    },
    appVersion: {
      type: String,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    // Utilizado para um delivery não receber corrido durante um determinado tempo
    lastQueue: {
      type: Date,
      required: false,
    },
    // informações financeira
    bankData: {
      type: BankShema,
      required: false,
    },
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "delivery_man",
  },
);

schema.index({ status: 1 });
schema.index({ isOnline: 1 });
schema.index({ flag: 1 });
schema.index({ location: 1 });
schema.index({ person: 1 });
schema.index({ company: 1 });
schema.index({ companyService: -1 });
schema.index({ lastQueue: -1 });
schema.index({ typeOfVehicle: -1 });
schema.index({ franchise: -1 });
schema.index({ updatedLastLocation: -1 });
schema.index({ updatedAt: -1 });

module.exports = mongoose.model("DeliveryMan", schema, "deliveryMan");

/** # flag
 * FREE -> Livre para Corrida
 * ON_ROUTE -> Corrida Aceita fluxo de entrega
 * UNAVAILABLE -> Não está disponível para receber pedidos
 */
