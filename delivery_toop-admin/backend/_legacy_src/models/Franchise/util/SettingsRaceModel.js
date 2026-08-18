const { Schema } = require("mongoose");

const dynamicsSchema = new Schema({
  timeRange: {
    /** range de minutos, ex: nos ultimos 10 min */
    type: Number,
    required: true,
  },
  amoutStart: {
    /** quantidade de corrida minima para aplicar a % */
    type: Number,
    required: true,
  },
  amoutEnd: {
    /** quantidade de corrida maxima para aplicar a % */
    type: Number,
    required: true,
  },
  percent: {
    /** percentual a ser acrescido no valor final da corrida */
    type: Number,
    required: true,
  },
  ray: {
    /** raio em metros */
    type: Number,
    required: true,
  },
});

const recalculateSchema = new Schema({
  status: {
    type: Boolean,
    required: true,
    default: false,
  },
  timeAbove: {
    // Minutos Acima
    type: Number,
    required: true,
    default: 2,
  },
  timeBelow: {
    // Minutos Abaixo
    type: Number,
    required: true,
    default: 2,
  },
  distanceAbove: {
    // Metros Acima
    type: Number,
    required: true,
    default: 400,
  },
  distanceBelow: {
    // Metros Abaixo
    type: Number,
    required: true,
    default: 400,
  },
});

const SettingsRaceSchema = new Schema({
  expiresNewRaceTime: {
    type: Number,
    default: 20,
    required: false,
  },
  dynamics: [dynamicsSchema],
  recalculate: recalculateSchema,
});

module.exports = SettingsRaceSchema;
