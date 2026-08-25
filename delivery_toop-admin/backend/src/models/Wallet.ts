import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  driver: mongoose.Types.ObjectId;
  balance: number;
  totalEarnings: number;
  totalWithdrawals: number;
  lastTransaction?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWalletTransaction extends Document {
  wallet: mongoose.Types.ObjectId;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  booking?: mongoose.Types.ObjectId;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalWithdrawals: { type: Number, default: 0 },
    lastTransaction: { type: Schema.Types.ObjectId, ref: 'WalletTransaction' },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

WalletSchema.index({ driver: 1 });

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    wallet: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    description: { type: String, required: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

WalletTransactionSchema.index({ wallet: 1 });
WalletTransactionSchema.index({ createdAt: -1 });

export const WalletModel = mongoose.model<IWallet>('Wallet', WalletSchema);
export const WalletTransactionModel = mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);
