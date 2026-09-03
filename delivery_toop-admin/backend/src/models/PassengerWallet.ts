import mongoose, { Schema, Document } from 'mongoose';

export interface IPassengerWalletTransaction {
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  balanceAfter: number;
  reference?: mongoose.Types.ObjectId;
  referenceType?: string;
  createdAt: Date;
}

export interface IPassengerWallet extends Document {
  holder: mongoose.Types.ObjectId;
  balance: number;
  transactions: IPassengerWalletTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const PassengerWalletTransactionSchema = new Schema<IPassengerWalletTransaction>(
  {
    type: { type: String, enum: ['credit', 'debit'], required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    reference: { type: Schema.Types.ObjectId },
    referenceType: { type: String },
  },
  { timestamps: true }
);

const PassengerWalletSchema = new Schema<IPassengerWallet>(
  {
    holder: { type: Schema.Types.ObjectId, ref: 'Passenger', required: true },
    balance: { type: Number, default: 0, min: 0 },
    transactions: { type: [PassengerWalletTransactionSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } },
  }
);

PassengerWalletSchema.index({ holder: 1 });

export const PassengerWalletModel = mongoose.model<IPassengerWallet>(
  'PassengerWallet',
  PassengerWalletSchema,
  'passenger_wallet'
);
