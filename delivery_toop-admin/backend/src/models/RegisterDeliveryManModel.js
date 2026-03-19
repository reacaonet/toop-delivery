const mongoose = require("mongoose");
const PointSchema = require("./utils/PointSchema");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cpf: {
      type: String,
      required: true,
    },
    celphone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    state_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SettingState",
      required: true,
    },
    city_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SettingCity",
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ["CAR", "MOTORCYCLE", "BIKE"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ANALYZE", "DECLINED", "APPROVED"],
      required: true,
    },
    imageSelfie: {
      type: [String],
      required: true,
    },
    imagesCnh: {
      type: [String],
    },
    imagesDocuments: {
      type: [String],
    },
    location: {
      type: PointSchema,
      index: "2dsphere",
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "registerDeliveryMan",
  },
);

module.exports = mongoose.model("RegisterDeliveryMan", schema, "registerDeliveryMan");
