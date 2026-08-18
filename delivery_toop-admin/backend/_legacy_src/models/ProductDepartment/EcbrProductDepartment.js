const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  barcode: {
    type: String,
    required: true,
    unique: true,
  },
  keywords: {
    type: [String],
    required: false,
  },
  images: {
    type: [String],
    required: false,
  },
  departments: {
    type: [mongoose.Types.ObjectId],
    required: false,
  },
  // Peso
  weight: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  copyright: {
    type: Boolean,
    default: false,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
    default: true,
  },
},
{
  timestamps: true,
});

schema.index({barCode: -1});
schema.index({status: -1});
schema.index({createdAt: -1});
schema.index({updatedAt: -1});
schema.index({copyright: -1});
schema.index({departments: -1});
schema.index({images: -1});

module.exports = mongoose.model("Ecbr_ProductDepartment", schema, "ecbr_ProductDepartment");
