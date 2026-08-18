const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    vehicleManufacturer: {
      // Fabricante do veiculo
      type: String,
      required: true,
    },
    vehicleModel: {
      // modelo do veiculo
      type: String,
      required: true,
    },
    vehicleNameplate: {
      // Placa de Identificação
      type: String,
      required: true,
    },
    vehicleYear: {
      type: Number,
      required: true,
    },
    vehicleColor: {
      type: String,
      required: true,
    },
    carsDocument: {
      type: [String],
      required: false,
    },
    approved: {
      type: Boolean,
      required: false,
      default: false,
    },
    status: {
      type: Boolean,
      required: false,
      default: false,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ driver: -1 });
schema.index({ approved: -1 });
schema.index({ status: -1 });
schema.index({ createdAt: -1 });

const VehicleDocumentsDriversModel = model("VehicleDocuments", schema, "vehicleDocuments");

module.exports = VehicleDocumentsDriversModel;
