const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    type: {
      type: String,
      enum: ["driver", "user"],
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    code: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ type: -1 });
schema.index({ code: -1 });
schema.index({ email: -1 });
schema.index({ createdAt: -1 });

const ResetPasswordModel = model("ResetPassword", schema, "resetPassword");
module.exports = ResetPasswordModel;
