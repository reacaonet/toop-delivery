const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  keywords: {
    type: [String],
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  unity: {
    type: String,
    enum: ['unidade', 'peso', 'duzia'],
    default: 'unidade',
    required: true,
  },
  barcode: {
    type: String,
    required: false,
  },
  barcodeBox: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: false,
  },
  pricePromotion: {
    type: Number,
    required: false,
  },
  dateInitPricePromotion: {
    type: Date,
    required: false,
  },
  dateFinishPricePromotion: {
    type: Date,
    required: false,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  productDepartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ecbr_ProductDepartment',
    required: false,
  },
  maximumAmount: {
    type: Number,
    default: 0,
    required: true,
  },
  images: [String],
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
  copyright: {
    type: Boolean,
    required: false,
  },
  department: {
    type: [{
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Department'
    }],
    default: [],
    required: false,
  },
  quantityStockAtual: {
    type: Number,
    required: false,
  },
  quantityStockMinimum: {
    type: Number,
    required: false,
  },
  // Ultimo preço antes da alteração da Integração
  lastPrice: {
    type: Number,
    required: false,
  },
  // Data da Alteração de Preço
  updatePrice: {
    type: Date,
    required: false,
  },
  problemSituation: {
    type: String,
    enum: [
      'WORTHLESS_PRODUCT',
      'INVALID_BAR_CODE',
    ],
    required: false,
  },
  existImageBank: {
    type: Boolean,
    required: false,
  },
  idImageBank: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Ecbr_ProductDepartment'
  },
}, {
  timestamps: true,
  collection: "product"
});

schema.index({company: 1});
schema.index({ department: -1 });
schema.index({ barcode: 1 });
schema.index({ name: "text"});
schema.index({ name: -1});
schema.index({ active: -1});
schema.index({ keywords: -1});
schema.index({ createdAt: -1});
schema.index({ updatedAt: -1});
schema.index({ copyright: -1 });
schema.index({ updatePrice: -1 });
schema.index({ existImageBank: -1 });
schema.index({ idImageBank: -1 });

module.exports = mongoose.model('Product', schema, 'product');

/**
 * reasonDisabled
 * WORTHLESS_PRODUCT - Produto Sem valor
 * INVALID_BAR_CODE - Código de Barra Inválido
 */
