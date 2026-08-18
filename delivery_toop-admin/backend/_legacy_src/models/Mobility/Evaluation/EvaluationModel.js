const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    typeEvaluator: {
      type: String,
      enum: ["passenger", "driver"],
      required: true,
    },
    typeRated: {
      type: String,
      enum: ["passenger", "driver"],
      required: true,
    },
    idEvaluator: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    idRated: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    paymentDriver: {
      type: Schema.Types.ObjectId,
      ref: "PaymentDriver",
      required: true,
    },
    stars: {
      type: Number,
      // enum: [1, 2, 3, 4, 5],
      min: 1,
      max: 5,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ typeEvaluator: 1 });
schema.index({ typeRated: 1 });
schema.index({ idEvaluator: 1 });
schema.index({ idRated: 1 });
schema.index({ paymentDriver: 1 });
schema.index({ createdAt: 1 });

const EvaluationModel = model("Evaluation", schema, "evaluation");
module.exports = EvaluationModel;
