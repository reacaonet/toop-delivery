import mongoose, { Schema, Document } from 'mongoose';

export interface IStockMovement extends Document {
  type: 'entry' | 'exit' | 'transfer' | 'adjustment';
  stockItem: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  batch?: mongoose.Types.ObjectId;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  order?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  reason?: string;
  movementDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>(
  {
    type: {
      type: String,
      required: true,
      enum: ['entry', 'exit', 'transfer', 'adjustment'],
    },
    stockItem: { type: Schema.Types.ObjectId, ref: 'StockItem', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    batch: { type: Schema.Types.ObjectId, ref: 'StockBatch' },
    quantity: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, min: 0 },
    totalCost: { type: Number, min: 0 },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, trim: true },
    movementDate: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

StockMovementSchema.index({ branch: 1, movementDate: -1 });
StockMovementSchema.index({ stockItem: 1, branch: 1 });
StockMovementSchema.index({ type: 1, movementDate: -1 });
StockMovementSchema.index({ order: 1 });

export default mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);
