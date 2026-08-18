const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ driver: -1 });
schema.index({ code: -1 });
schema.index({ createdAt: -1 });

const QrCodeDriverModel = model("QrCodeDriver", schema, "qrCodeDriver");
module.exports = QrCodeDriverModel;
