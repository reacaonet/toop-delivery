const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    codigo_ibge: {
      type: Number,
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
    },
    capital: {
      type: String,
      required: true,
    },
    codigo_uf: {
      type: Number,
      required: true,
    },
    siafi_id: {
      type: Number,
      required: true,
    },
    ddd: {
      type: Number,
      required: true,
    },
    fuso_horario: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


schema.index({ codigo_uf: -1 });
schema.index({ nome: "text" });
schema.index({ nome: -1 });


module.exports = mongoose.model("CityBr", schema, "city_br");
