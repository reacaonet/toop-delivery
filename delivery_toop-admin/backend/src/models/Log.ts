import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  typeSystem: 'MOBILE' | 'WEB' | 'BACKEND' | 'UNDEFINED';
  typeLog: 'WARN' | 'ERROR' | 'ALERT' | 'SUCCESS' | 'UNDEFINED';
  description: any;
  category?: string;
  originError?: string;
  path?: string;
  error?: any;
  method?: string;
  type?: string;
  level?: number;
  origin?: string;
  request?: any;
  createdAt: Date;
  updatedAt: Date;
}

const LogSchema = new Schema<ILog>(
  {
    typeSystem: {
      type: String,
      enum: ['MOBILE', 'WEB', 'BACKEND', 'UNDEFINED'],
      default: 'UNDEFINED',
      required: true,
    },
    typeLog: {
      type: String,
      enum: ['WARN', 'ERROR', 'ALERT', 'SUCCESS', 'UNDEFINED'],
      default: 'UNDEFINED',
      required: true,
    },
    description: { type: Schema.Types.Mixed, default: '' },
    category: { type: String },
    originError: { type: String },
    path: { type: String },
    error: { type: Schema.Types.Mixed },
    method: { type: String },
    type: { type: String, enum: ['error'] },
    level: { type: Number },
    origin: { type: String },
    request: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: 'log',
    toJSON: {
      transform(_doc, ret) {
        const { __v: _v, ...rest } = ret;
        return rest;
      },
    },
  }
);

LogSchema.index({ createdAt: -1 });
LogSchema.index({ typeLog: -1 });
LogSchema.index({ category: -1 });

export const LogModel = mongoose.model<ILog>('Log', LogSchema, 'log');
