const { Schema } = require("mongoose");

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    error: {
      type: Schema.Types.Mixed,
      required: true,
    },
    disableDocument: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = schema;

/**
 "error": {
      "notFound": {
        "title": "Selecionar Documento",
        "message": "Não foi possível selecionar arquivo"
      },
      "catch": {
        "title": "Selecionar Documento",
        "message": "Não foi possível enviar documento, por favor tente mais tarde!"
      }
    }
 */
