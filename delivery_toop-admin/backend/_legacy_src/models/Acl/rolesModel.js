const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "AclRoles",
  }
);

module.exports = mongoose.model("AclRoles", schema, "acl_roles");
