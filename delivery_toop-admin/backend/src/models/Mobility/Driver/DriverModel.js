const { Schema, model } = require("mongoose");

const PointSchema = require("../../utils/PointSchema");

const schema = new Schema(
  {
    franchise: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    ddi: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      // unique: true,
      required: true,
    },
    email: {
      type: String,
      // unique: true,
      required: true,
    },
    cpf: {
      type: String,
      required: false,
    },
    nif: {
      type: String,
      required: false,
    },
    birthDate: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    services: {
      type: [Schema.Types.ObjectId],
      ref: "Service",
      required: true,
    },
    categoryServices: {
      // driver | delivery | package
      type: [String],
      default: ["driver"],
      required: false,
    },
    carsDocument: [String],
    cnhDocuments: [String],
    identityDocuments: [String],
    selfiePhoto: [String],
    address: {
      type: String,
      required: false,
    },
    location: {
      type: PointSchema,
      index: "2dsphere",
      required: false,
    },
    online: {
      type: Boolean,
      default: false,
      required: true,
    },
    vehicleManufacturer: {
      // Fabricante do veiculo
      type: String,
      required: false,
    },
    vehicleModel: {
      // modelo do veiculo
      type: String,
      required: false,
    },
    vehicleNameplate: {
      // Placa de Identificação
      type: String,
      required: false,
    },
    vehicleYear: {
      type: Number,
      required: false,
    },
    vehicleColor: {
      type: String,
      required: false,
    },
    accessToken: {
      type: String,
      required: false,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    timeZone: {
      type: String,
      default: "America/Sao_Paulo",
      required: false,
    },
    approved: {
      type: Boolean,
      default: false,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    appVersion: {
      type: String,
      required: false,
    },
    // Utilizado para  não receber corrido durante um determinado tempo
    lastQueue: {
      type: Date,
      required: false,
    },
    token: {
      // token de notificação Firebase
      type: String,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    activeRunStatus: {
      type: String,
      enum: ["available", "race_accepted", "race_in_progress"],
      default: "available",
      required: false,
    },
    activeRun: {
      type: [String],
      ref: "Booking",
      required: false,
    },
    stars: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    percentService: {
      // porcentagem cobrado pela franquia do motorista
      type: Number,
      required: false,
      default: 5,
      min: 0,
      max: 100,
    },
    rating: {
      totalRating: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
      totalStars: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
      required: false,
    },
    jwtToken: {
      type: String,
      required: false,
    },
    typePaymentService: {
      // tipos de serviços aceitos
      type: [Schema.Types.ObjectId],
      ref: "TypePaymentService",
      required: true,
    },
    genre: {
      type: String,
      enum: ["H", "M"],
      required: false,
    },
    topics: {
      type: Schema.Types.Array,
      required: false,
    },
    creditBalance: {
      type: Number,
      required: false,
      default: 0,
    },
    bankData: {
      name: {
        type: String,
        required: false,
      },
      cpfCnpj: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      bank: {
        type: String,
        required: false,
      },
      agency: {
        type: String,
        required: false,
      },
      account: {
        type: String,
        required: false,
      },
      type: {
        type: String,
        required: false,
      },
    },
    terms: {
      type: Boolean,
      required: true,
      default: true,
    },
    block: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ location: "2dsphere" });
schema.index({ name: "text" });
schema.index({ name: -1 });
schema.index({ status: -1 });
schema.index({ online: -1 });
schema.index({ approved: -1 });
schema.index({ franchise: -1 });
schema.index({ services: -1 });
schema.index({ categoryServices: -1 });
schema.index({ email: -1 });
schema.index({ lastQueue: -1 });
schema.index({ token: -1 });
schema.index({ activeRunStatus: -1 });
schema.index({ activeRun: -1 });
schema.index({ genre: -1 });
schema.index({ deletedAt: -1 });
schema.index({ updatedAt: -1 });
schema.index({ createdAt: -1 });
schema.index({ topics: -1 });

const DriverModel = model("Driver", schema, "driver");
module.exports = DriverModel;
