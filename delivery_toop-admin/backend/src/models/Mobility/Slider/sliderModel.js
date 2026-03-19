const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    franchise: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
    image: {
      type: [String],
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    impressions: {
      type: String,
      required: true,
    },
    destinationurl: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      enum: ["passenger", "driver"],
    },
    status: {
      type: Boolean,
      default: false,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "mob_slider",
  },
);

schema.index({ franchise: -1 });
schema.index({ status: -1 });
schema.index({ target: -1 });
schema.index({ deletedAt: 1 });

module.exports = model("mob_slider", schema, "mob_slider");
