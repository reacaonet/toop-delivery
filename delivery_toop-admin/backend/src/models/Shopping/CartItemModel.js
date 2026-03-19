const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    shoppingCart: {
      type: mongoose.Types.ObjectId,
      ref: "ShoppingCart",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    foodProduct: {
      type: mongoose.Types.ObjectId,
      ref: "FoodProduct",
      required: false,
    },
    accessoriesProduct: {
      type: mongoose.Types.ObjectId,
      ref: "AccessoriesProduct",
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    barcode: {
      type: String,
      required: false,
    },
    images: {
      type: [String],
      required: false,
    },
    amount: {
      type: Number,
      default: 1,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    pricePromotion: {
      type: Number,
      required: false,
    },
    check: {
      type: Array,
      required: false,
    },
    radio: {
      type: Array,
      required: false,
    },
    type: {
      type: String,
      enum: ["supermarket", "restaurant", "accessories"],
      required: true,
    },
    shopperCheck: {
      type: Boolean,
      enum: [true, false],
      default: false,
      required: true,
    },
    shopper: {
      type: mongoose.Types.ObjectId,
      ref: "Shopper",
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
    comment: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
    edited: {
      type: Boolean,
      default: false,
      required: true,
    },
    isPizza: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      required: false,
    },
    pieces: {
      type: Number,
      required: false,
    },
    flavors: {
      type: Number,
      required: false,
    },
    billing_mode: {
      type: String,
      required: false,
    },
    addToShopper: {
      type: Boolean,
      default: false,
      required: true,
    },
    // Dados do Carrinho antigo payload total
    editedFromItem: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "shoppingCartItem",
  },
);

schema.index({ shoppingCart: -1 });
schema.index({ type: -1 });
schema.index({ isDeleted: 1 });
schema.index({ product: -1 });
schema.index({ foodProduct: -1 });

module.exports = mongoose.model("ShoppingCartItem", schema, "shoppingCartItem");
