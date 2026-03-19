const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    codigo_uf: {
      type: Number,
      required: true,
    },
    uf: {
      type: String,
      required: true,
    },
    nome: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);


schema.index({ nome: -1 });

module.exports = mongoose.model("StateBr", schema, "state_br");
