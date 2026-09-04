import mongoose, { Schema, Document } from 'mongoose';

export const WEEK_DAYS = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

export const SCHEDULE_TYPES = ['BOTH', 'DELIVERY', 'WITHDRAWAL'] as const;

export interface IShoppingSchedule extends Document {
  company: mongoose.Types.ObjectId;
  dayWeek: (typeof WEEK_DAYS)[number];
  startHour: number;
  endHour: number;
  deletedAt?: Date;
  type: (typeof SCHEDULE_TYPES)[number];
  createdAt: Date;
  updatedAt: Date;
}

const ShoppingScheduleSchema = new Schema<IShoppingSchedule>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    dayWeek: { type: String, enum: WEEK_DAYS, required: true },
    startHour: { type: Number, required: true },
    endHour: { type: Number, required: true },
    deletedAt: { type: Date, required: false },
    type: { type: String, enum: SCHEDULE_TYPES, default: 'BOTH', required: true },
  },
  { timestamps: true, collection: 'schedule' }
);

ShoppingScheduleSchema.index({ company: 1, type: -1 });

export const ShoppingScheduleModel = mongoose.model<IShoppingSchedule>(
  'ShoppingSchedule',
  ShoppingScheduleSchema,
  'schedule'
);