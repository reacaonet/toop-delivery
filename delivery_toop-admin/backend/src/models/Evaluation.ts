import mongoose, { Schema, Document } from 'mongoose';

export interface IEvaluation extends Document {
  typeEvaluator: 'passenger' | 'driver';
  typeRated: 'passenger' | 'driver';
  idEvaluator: mongoose.Types.ObjectId;
  idRated: mongoose.Types.ObjectId;
  paymentDriver?: mongoose.Types.ObjectId;
  stars: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EvaluationSchema = new Schema<IEvaluation>(
  {
    typeEvaluator: { type: String, enum: ['passenger', 'driver'], required: true },
    typeRated: { type: String, enum: ['passenger', 'driver'], required: true },
    idEvaluator: { type: Schema.Types.ObjectId, required: true },
    idRated: { type: Schema.Types.ObjectId, required: true },
    paymentDriver: { type: Schema.Types.ObjectId, ref: 'PaymentDriver' },
    stars: { type: Number, min: 1, max: 5, required: true },
    description: { type: String },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

EvaluationSchema.index({ typeEvaluator: 1 });
EvaluationSchema.index({ typeRated: 1 });
EvaluationSchema.index({ idEvaluator: 1 });
EvaluationSchema.index({ idRated: 1 });
EvaluationSchema.index({ paymentDriver: 1 });
EvaluationSchema.index({ createdAt: 1 });

export const EvaluationModel = mongoose.model<IEvaluation>('Evaluation', EvaluationSchema, 'evaluation');
