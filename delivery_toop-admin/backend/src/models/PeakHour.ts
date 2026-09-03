import mongoose, { Schema, Document } from 'mongoose';

export interface IPeakHour extends Document {
  franchise: mongoose.Types.ObjectId;
  start: string;
  end: string;
  status: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PeakHourSchema = new Schema<IPeakHour>(
  {
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise', required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    status: { type: Boolean, required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

PeakHourSchema.index({ status: -1 });
PeakHourSchema.index({ start: 'text' });
PeakHourSchema.index({ start: -1 });
PeakHourSchema.index({ end: 'text' });
PeakHourSchema.index({ end: -1 });
PeakHourSchema.index({ deletedAt: -1 });

export const PeakHourModel = mongoose.model<IPeakHour>('PeakHour', PeakHourSchema, 'peakHour');
