import mongoose, { Schema, Document } from 'mongoose';

export interface IPopup extends Document {
  images?: string[];
  name: string;
  company: mongoose.Types.ObjectId;
  status: boolean;
  startDate: Date;
  endDate: Date;
  priorities: number;
  vizualizations: number;
  quantityViews: number;
  message: string;
  textMessageButton?: string;
  width?: number;
  height?: number;
  url?: string;
  redirectTo?: string;
  deletedAt?: Date;
  startHour: number;
  endHour: number;
  createdAt: Date;
  updatedAt: Date;
}

const PopupSchema = new Schema<IPopup>(
  {
    images: [{ type: String }],
    name: { type: String, required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    status: { type: Boolean, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    priorities: { type: Number, default: 0, required: true },
    vizualizations: { type: Number, default: 0, required: true },
    quantityViews: { type: Number, default: 0 },
    message: { type: String, required: true },
    textMessageButton: { type: String, default: '' },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    url: { type: String },
    redirectTo: { type: String, enum: ['HOME', 'URL', 'ROUTE'], default: 'HOME' },
    deletedAt: { type: Date },
    startHour: { type: Number, default: 0, required: true },
    endHour: { type: Number, default: 2359, required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

PopupSchema.index({ deletedAt: 1 });
PopupSchema.index({ company: 1, status: 1 });

export const PopupModel = mongoose.model<IPopup>('Popup', PopupSchema, 'popup');
