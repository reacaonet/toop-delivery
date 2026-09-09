import mongoose, { Schema, Document } from 'mongoose';

export const SHOPPING_ITEM_TYPES = ['supermarket', 'restaurant', 'accessories'] as const;

export interface IShoppingCartItem extends Document {
  cart: mongoose.Types.ObjectId;
  product?: mongoose.Types.ObjectId;
  name: string;
  amount: number;
  price: number;
  total: number;
  check: boolean;
  radio?: string;
  type: (typeof SHOPPING_ITEM_TYPES)[number];
  shopper?: mongoose.Types.ObjectId;
  isPizza: boolean;
  size?: string;
  pieces?: string;
  flavors?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShoppingCartItemSchema = new Schema<IShoppingCartItem>(
  {
    cart: { type: Schema.Types.ObjectId, ref: 'ShoppingCart', required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: 'AccessoriesProduct' },
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    check: { type: Boolean, default: true },
    radio: { type: String },
    type: { type: String, enum: SHOPPING_ITEM_TYPES, default: 'supermarket' },
    shopper: { type: Schema.Types.ObjectId, ref: 'Shopper' },
    isPizza: { type: Boolean, default: false },
    size: { type: String },
    pieces: { type: String },
    flavors: [{ type: String }],
    notes: { type: String },
  },
  { timestamps: true, collection: 'shoppingCartItem' }
);

ShoppingCartItemSchema.index({ cart: 1, check: 1 });
ShoppingCartItemSchema.index({ shopper: 1 });

export const ShoppingCartItemModel = mongoose.model<IShoppingCartItem>(
  'ShoppingCartItem',
  ShoppingCartItemSchema,
  'shoppingCartItem'
);