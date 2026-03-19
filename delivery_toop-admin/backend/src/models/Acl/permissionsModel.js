const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    roles: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AclRoles",
      required: true,
    },
    route: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "AclPermissions",
  }
);

module.exports = mongoose.model("AclPermissions", schema, "acl_permissions");