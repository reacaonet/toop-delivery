const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "audio", "image", "text_alert"],
      default: "text",
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    sent: {
      type: String,
      enum: ["driver", "passenger"],
      required: true,
    },
    receive: {
      type: String,
      enum: ["driver", "passenger"],
      required: true,
    },
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

const ChatRaceModel = model("ChatRace", schema, "chatRace");
module.exports = ChatRaceModel;
