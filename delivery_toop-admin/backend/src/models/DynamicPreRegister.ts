import mongoose, { Schema, Document } from 'mongoose';
import { InputTypeShema, IInputType } from './utils/DynamicPreRegister/InputTypeShema';
import { UploadDocPhotoShema, IUploadDocPhoto } from './utils/DynamicPreRegister/UploadDocPhotoShema';

export interface IDynamicPreRegister extends Document {
  view: string;
  nextView: string;
  country?: string;
  uploadDocPhoto?: boolean;
  uploadDocPhotoPayload?: IUploadDocPhoto;
  inputType?: string;
  inputGroup?: string;
  listPopulate?: string;
  inputTypePayload?: IInputType;
  footer?: any;
  createdAt: Date;
  updatedAt: Date;
}

const DynamicPreRegisterSchema = new Schema<IDynamicPreRegister>(
  {
    view: { type: String, required: true },
    nextView: { type: String, required: true },
    country: { type: String, default: '' },
    uploadDocPhoto: { type: Boolean },
    uploadDocPhotoPayload: { type: UploadDocPhotoShema },
    inputType: { type: String },
    inputGroup: { type: String },
    listPopulate: { type: String },
    inputTypePayload: { type: InputTypeShema },
    footer: { type: Schema.Types.Mixed },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

DynamicPreRegisterSchema.index({ view: -1 });
DynamicPreRegisterSchema.index({ nextView: -1 });
DynamicPreRegisterSchema.index({ country: 1 });

export const DynamicPreRegisterModel = mongoose.model<IDynamicPreRegister>('dynamicPreRegister', DynamicPreRegisterSchema, 'dynamicPreRegister');
