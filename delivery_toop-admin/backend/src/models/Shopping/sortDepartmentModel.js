const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    order: {
      type: Number,
      min: 1,
      required: true,
      default: 1,
    }
  },
  {
    timestamps: true,
  }
);

schema.index({ company: -1 });
schema.index({ department: -1 });

module.exports = mongoose.model("SortDepartment", schema, "sortDepartment");
