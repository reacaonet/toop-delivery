const mongoose = require("mongoose");

/**
 * Name -> Nome que será vinculado o Departamento
 * Suggesteds -> Nomes que podem ser vinculadas ao Departamento
 */

const schema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: false,
    },
    name: {
      type: String,
      unique: true,
      required: true,
    },
    showInApp: {
      type: Boolean,
      default: true,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "departmentmobile",
  },
);

schema.index({ name: 1 });
schema.index({ franchise: 1 });
schema.index({ company: 1 });

module.exports = mongoose.model("DepartmentMobile", schema, "departmentmobile");
