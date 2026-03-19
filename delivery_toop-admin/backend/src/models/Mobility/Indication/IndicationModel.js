const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    person: {
      type: Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    personReceive: {
      // Person que irá receber os créditos
      type: Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    referralCode: {
      type: String,
      required: false,
    },
    total: {
      type: Number,
      required: true,
    },
    rescued: {
      // resgatado
      type: Boolean,
      required: true,
      default: false,
    },
    active: {
      // Liberar para restagar - aguardando primeira viagem
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ person: -1 });
schema.index({ personReceive: -1 });
schema.index({ referralCode: -1 });
schema.index({ createdAt: -1 });

const IndicationModel = model("Indication", schema, "indication");

module.exports = IndicationModel;
