import mongoose, { Schema, Document } from 'mongoose';

export interface IPopupView extends Document {
  popup: mongoose.Types.ObjectId;
  person: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PopupViewSchema = new Schema<IPopupView>(
  {
    popup: { type: Schema.Types.ObjectId, ref: 'popup', required: true },
    person: { type: Schema.Types.ObjectId, ref: 'person', required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

PopupViewSchema.index({ popup: 1, person: 1 });

export const PopupViewModel = mongoose.model<IPopupView>('PopupView', PopupViewSchema, 'popupView');
