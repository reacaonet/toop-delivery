import mongoose, { Schema, Document } from 'mongoose';

export interface IStockBatch extends Document {
  stockItem: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  quantity: number;
  initialQuantity: number;
  unitCost: number;
  batchNumber: string;
  supplier?: string;
  expiryDate?: Date;
  entryDate: Date;
  status: 'active' | 'expired' | 'consumed';
  createdAt: Date;
  updatedAt: Date;
}

const StockBatchSchema = new Schema<IStockBatch>(
  {
    stockItem: { type: Schema.Types.ObjectId, ref: 'StockItem', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    quantity: { type: Number, required: true, min: 0 },
    initialQuantity: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, required: true, min: 0 },
    batchNumber: { type: String, required: true, trim: true },
    supplier: { type: String, trim: true },
    expiryDate: { type: Date },
    entryDate: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ['active', 'expired', 'consumed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

StockBatchSchema.index({ stockItem: 1, branch: 1, status: 1 });
StockBatchSchema.index({ branch: 1, status: 1 });
StockBatchSchema.index({ expiryDate: 1, status: 1 });

export default mongoose.model<IStockBatch>('StockBatch', StockBatchSchema);
