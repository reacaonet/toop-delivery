const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    person: {
      type: Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    franchise: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    token: {
      type: String,
      required: false,
    },
    stars: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
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
    referralCode: {
      type: String,
      required: false,
      unique: true,
    },
    topics: {
      type: Schema.Types.Array,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "passenger",
  },
);

schema.index({ type: 1 });
schema.index({ status: -1 });
schema.index({ person: -1 });
schema.index({ name: "text" });
schema.index({ name: -1 });
schema.index({ referralCode: -1 });
schema.index({ topics: -1 });

const PassegerModel = model("Passenger", schema, "passenger");
module.exports = PassegerModel;
