const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ booking: -1 });
schema.index({ driver: -1 });
schema.index({ createdAt: -1 });

const NotifyQueueDriver = model("NotifyQueueDriver", schema, "notifyQueueDriver");

module.exports = NotifyQueueDriver;
