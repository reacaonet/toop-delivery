import mongoose, { Schema, Document } from 'mongoose';

export interface IStockItem extends Document {
  name: string;
  company: mongoose.Types.ObjectId;
  category?: string;
  unit: 'kg' | 'g' | 'un' | 'L' | 'ml' | 'cx' | 'pct';
  minimumStock: number;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StockItemSchema = new Schema<IStockItem>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    category: { type: String, trim: true },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'g', 'un', 'L', 'ml', 'cx', 'pct'],
      default: 'un',
    },
    minimumStock: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

StockItemSchema.index({ company: 1, active: 1 });
StockItemSchema.index({ company: 1, name: 'text' });

export default mongoose.model<IStockItem>('StockItem', StockItemSchema);
