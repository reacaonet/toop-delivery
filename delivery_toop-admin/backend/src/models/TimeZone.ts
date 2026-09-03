import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeZone extends Document {
  offset: number;
  zone: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimeZoneSchema = new Schema<ITimeZone>(
  {
    offset: { type: Number, min: -14, max: 13, required: true },
    zone: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true, collection: 'timeZone', toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

TimeZoneSchema.index({ offset: -1 });

export const TimeZoneModel = mongoose.model<ITimeZone>('TimeZone', TimeZoneSchema, 'timeZone');
