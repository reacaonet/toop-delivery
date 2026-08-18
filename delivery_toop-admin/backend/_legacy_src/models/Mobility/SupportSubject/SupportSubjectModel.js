const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    franchise: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      enum: ["PASSENGER", "DRIVER"],
      default: "PASSENGER",
      required: true,
    },
    target: {
      type: String,
      enum: ["CANCEL", "SUPPORT"],
      default: "CANCEL",
      required: true,
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
schema.index({ franchise: -1 });
schema.index({ status: -1 });
schema.index({ subject: "text" });
schema.index({ subject: -1 });
schema.index({ createdAt: 1 });
schema.index({ deletedAt: 1 });
schema.index({ target: -1 });

module.exports = model("SupportSubject", schema, "supportSubject");
