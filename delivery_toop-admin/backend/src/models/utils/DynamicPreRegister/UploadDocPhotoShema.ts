import { Schema } from 'mongoose';

export interface IUploadDocPhoto {
  title: string;
  subtitle?: string;
  image?: string;
  name: string;
  error: any;
  disableDocument: boolean;
}

export const UploadDocPhotoShema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String },
    name: { type: String, required: true },
    error: { type: Schema.Types.Mixed, required: true },
    disableDocument: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, _id: false }
);
