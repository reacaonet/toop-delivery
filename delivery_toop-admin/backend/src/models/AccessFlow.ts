import mongoose, { Schema, Document } from 'mongoose';

export interface IAccessFlow extends Document {
  franchise?: mongoose.Types.ObjectId;
  device?: string;
  customer?: mongoose.Types.ObjectId;
  person?: mongoose.Types.ObjectId;
  version?: string;
  history?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccessFlowSchema = new Schema<IAccessFlow>(
  {
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise' },
    device: { type: String },
    customer: { type: Schema.Types.ObjectId, ref: 'User' },
    person: { type: Schema.Types.ObjectId, ref: 'Person' },
    version: { type: String },
    history: { type: String },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

AccessFlowSchema.index({ franchise: 1, createdAt: -1 });
AccessFlowSchema.index({ device: 1 });
AccessFlowSchema.index({ createdAt: -1 });

export const AccessFlowModel = mongoose.model<IAccessFlow>('AccessFlow', AccessFlowSchema, 'accessFlow');
