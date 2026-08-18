const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    franchise: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: false,
    },
    passenger: {
      type: Schema.Types.ObjectId,
      ref: "Passenger",
      required: false,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: false,
    },
    polylineStart: {
      type: String,
      required: true,
    },
    polylineEnd: {
      type: String,
      required: false,
    },
    imageStart: {
      type: String,
      required: false,
    },
    imageEnd: {
      type: String,
      required: false,
    },
    predictedDistance: {
      // meters
      type: Number,
      required: false,
    },
    predictedTime: {
      // seconds
      type: Number,
      required: false,
    },
    predictedPrice: {
      type: Number,
      required: false,
    },
    servicesCalculationBasis: {
      type: [Schema.Types.Mixed], // parametros utilizados no calculo
      default: [],
      required: false,
    },
    travelledDistance: {
      // meters
      type: Number,
      required: false,
    },
    travelledTime: {
      // seconds
      type: Number,
      required: false,
    },
    travelledPrice: {
      type: Number,
      required: false,
    },
    travelledCalculationBasis: {
      type: Schema.Types.Mixed, // parametros utilizados no calculo
      required: false,
    },
    status: {
      type: String,
      enum: ["search", "travelRequest", "concluded"],
      default: "search",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ franchise: -1 });
schema.index({ service: -1 });
schema.index({ passenger: -1 });
schema.index({ booking: -1 });
schema.index({ driver: -1 });
schema.index({ createdAt: -1 });

const TravelBookingInfo = model("travelBookingInfo", schema, "travelBookingInfo");
module.exports = TravelBookingInfo;
