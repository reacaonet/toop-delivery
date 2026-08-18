const { Schema, model } = require("mongoose");

const PointSchema = require("../../utils/PointSchema");

const schema = new Schema(
  {
    passenger: {
      type: Schema.Types.ObjectId,
      ref: "Passenger",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    location: {
      type: PointSchema,
      index: "2dsphere",
      required: true,
    },
    shortAddress: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ passenger: -1 });
schema.index({ location: "2dsphere" });
schema.index({ createdAt: -1 });

const FavoritePlacesModel = model("FavoritePlaces", schema, "favoritePlaces");

module.exports = FavoritePlacesModel;
