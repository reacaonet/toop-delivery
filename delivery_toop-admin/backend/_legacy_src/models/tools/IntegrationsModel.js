const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  company: {
    type: mongoose.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  system: {
    type: String,
    enum: ['JM_Diamante', 'RpInfo', 'Viva_Sistemas'],
    required: true,
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
}, {
  timestamps: true,
  collection: "intIntegrations",
}
);

module.exports = mongoose.model("IntIntegrations", schema, "int_integrations");