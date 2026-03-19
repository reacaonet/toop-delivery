const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    passenger: {
      type: Schema.Types.ObjectId,
      ref: "Passenger",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ driver: -1 });
schema.index({ passenger: -1 });

const FavoriteDriversModel = model("FavoriteDrivers", schema, "favoriteDrivers");

module.exports = FavoriteDriversModel;
