const { Schema, model, Types } = require("mongoose");

const DistancePerKM = require("../../utils/DistancePerKM");

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    franchise: {
      type: Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    priceCalculation: {
      type: Types.ObjectId,
      ref: "priceCalculations",
      required: false,
    },
    minimumRate: {
      type: Number,
    },
    hourlyPrice: {
      type: Number,
    },
    basePrice: {
      type: Number,
    },
    valueByPercentage: {
      // Valor em Porcentagem que a Franquia ira cobrar pelo serviço
      type: Number,
      min: 0,
      default: 0,
      required: false,
    },
    fixedValue: {
      // Valor em R$ que a Franquia ira cobrar pelo serviço
      type: Number,
      min: 0,
      default: 0,
      required: false,
    },
    baseDistance: {
      type: Number,
    },
    // raio máximo para procurar motoristas (em quilômetros)
    radiusSendRace: {
      type: Number,
      default: 8,
      required: true,
    },
    timePrice: {
      type: Number,
    },
    currencyPrice: {
      type: Number,
    },
    dispensingMinutes: {
      type: Number,
    },
    ratePerMinute: {
      type: Number,
    },
    peakHours: [
      {
        _id: {
          type: Types.ObjectId,
          ref: "PeakHour",
          required: false,
        },
        percent: { type: Number },
      },
    ],
    status: {
      type: Boolean,
      default: true,
      required: false,
    },
    onlyForWomen: {
      type: Boolean,
      default: false,
      required: false,
    },
    requireConfirmationCode: {
      type: Boolean,
      default: false,
      required: true,
    },
    images: [String],
    makers: [String],
    timeZone: {
      type: String,
      default: "America/Sao_Paulo",
      required: false,
    },
    utc: {
      type: Number,
      default: -3, // São Paulo Brasil
      required: false,
      min: -13,
      max: 15,
    },
    distance: {
      type: [DistancePerKM],
      required: false,
    },
    showArrivalTime: {
      type: Boolean,
      required: true,
      default: true,
    },
    type: {
      type: String,
      required: true,
      default: "car",
      enum: ["bike", "motorcycle", "car", "microbus", "bus", "truck", "package"],
    },
    info: {
      type: String,
      required: false,
    },
    useDynamicsRace: {
      // se é para usar corrida dinamica
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ type: 1 });
schema.index({ status: -1 });
schema.index({ franchise: -1 });
schema.index({ onlyForWomen: -1 });
schema.index({ deletedAt: 1 });
schema.index({ name: "text" });
schema.index({ name: -1 });
schema.index({ type: -1 });

const ServiceModel = model("Service", schema, "service");
module.exports = ServiceModel;
