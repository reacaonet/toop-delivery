import mongoose, { Schema, Document } from 'mongoose';

export interface IPassenger extends Document {
  person: mongoose.Types.ObjectId;
  franchise?: mongoose.Types.ObjectId;
  status: boolean;
  deletedAt?: Date;
  token?: string;
  stars: number;
  rating: {
    totalRating: number;
    totalStars: number;
  };
  referralCode?: string;
  topics?: any[];
  createdAt: Date;
  updatedAt: Date;
}

const PassengerSchema = new Schema<IPassenger>(
  {
    person: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise' },
    status: { type: Boolean, default: true, required: true },
    deletedAt: { type: Date },
    token: { type: String },
    stars: { type: Number, default: 0, min: 0, required: true },
    rating: {
      totalRating: { type: Number, default: 0, min: 0, required: true },
      totalStars: { type: Number, default: 0, min: 0, required: true },
    },
    referralCode: { type: String, unique: true, sparse: true },
    topics: { type: Schema.Types.Array },
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } },
  }
);

PassengerSchema.index({ type: 1 });
PassengerSchema.index({ status: -1 });
PassengerSchema.index({ person: -1 });
PassengerSchema.index({ referralCode: -1 });
PassengerSchema.index({ topics: -1 });

export const PassengerModel = mongoose.model<IPassenger>('Passenger', PassengerSchema, 'passenger');
