const { Schema, model } = require("mongoose");

/** Schemas */
const UploadDocPhotoShema = require("../utils/DynamicPreRegister/UploadDocPhotoShema");
const InputTypeShema = require("../utils/DynamicPreRegister/InputTypeShema");

const schema = new Schema(
  {
    view: {
      type: String,
      required: true,
    },
    nextView: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: false,
      default: "",
    },
    uploadDocPhoto: {
      type: Boolean,
      required: false,
    },
    uploadDocPhotoPayload: {
      type: UploadDocPhotoShema,
      required: false,
    },
    inputType: {
      type: String,
      required: false,
    },
    inputGroup: {
      type: String,
      required: false,
    },
    listPopulate: {
      type: String,
      required: false,
    },
    inputTypePayload: {
      type: InputTypeShema,
      required: false,
    },
    footer: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ view: -1 });
schema.index({ nextView: -1 });
schema.index({ country: 1 });

const DynamicPreRegisterModel = model("dynamicPreRegister", schema, "dynamicPreRegister");

module.exports = DynamicPreRegisterModel;
