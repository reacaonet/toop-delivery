import { Schema, Types } from 'mongoose';

export interface IValidator {
  min?: number;
  max?: number;
  title?: string;
  message?: string;
}

export interface IInputType {
  title?: string;
  subTitle?: string;
  inputType: string;
  inputName: string;
  inputPlaceholder?: string;
  textProps?: any;
  listKey?: string;
  list?: any[];
  validator?: IValidator;
  mask?: string;
}

export const ValidatorShema = new Schema(
  {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 255 },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
  },
  { timestamps: true, _id: false }
);

export const InputTypeShema = new Schema(
  {
    title: { type: String },
    subTitle: { type: String },
    inputType: { type: String, required: true },
    inputName: { type: String, required: true },
    inputPlaceholder: { type: String, default: '' },
    textProps: { type: Schema.Types.Mixed, default: {} },
    listKey: { type: String },
    list: [{ type: Schema.Types.Mixed }],
    validator: { type: ValidatorShema },
    mask: { type: String },
  },
  { timestamps: true, _id: false }
);
