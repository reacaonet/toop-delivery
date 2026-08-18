const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    password: {
      type: String,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: false,
    },
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    companies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Company",
      required: false,
    },
    franchises: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Franchise",
      required: false,
    },
    accessToken: {
      type: String,
      required: false,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    isRoot: {
      type: Boolean,
      require: false,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

schema.index({ person: -1 });
schema.index({ email: -1 });
schema.index({ name: 1 });
schema.index({ company: -1 });

module.exports = mongoose.model("Users", schema, "users");
