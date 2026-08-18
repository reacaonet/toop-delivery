const { Schema } = require("mongoose");

const schema = new Schema(
  {
    title: {
      type: String,
      required: false,
    },
    subTitle: {
      type: String,
      required: false,
    },
    inputType: {
      type: String,
      required: true,
    },
    inputName: {
      type: String,
      required: true,
    },
    inputPlaceholder: {
      type: String,
      default: "",
      required: false,
    },
    textProps: {
      type: Schema.Types.Mixed,
      default: {},
      required: false,
    },
    listKey: {
      type: String,
      required: false,
    },
    list: {
      type: [Schema.Types.Mixed],
      required: false,
    },
    validator: {
      type: {
        min: {
          type: Number,
          default: 0,
          required: false,
        },
        max: {
          type: Number,
          default: 255,
          required: false,
        },
        title: {
          type: String,
          default: "",
          required: false,
        },
        message: {
          type: String,
          default: "",
          required: false,
        },
      },
      required: false,
    },
    mask: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = schema;

/** textProps */
// autoCapitalize -> characters | words | sentences | none
// returnKeyType -> done | go | next | search | send
// keyboardType -> default | number-pad | decimal-pad | numeric | email-address | phone-pad | url
// secureTextEntry -> true | false
// maxLength -> number
