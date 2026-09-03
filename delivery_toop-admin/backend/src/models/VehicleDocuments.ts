import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicleDocuments extends Document {
  driver: mongoose.Types.ObjectId;
  vehicleManufacturer: string;
  vehicleModel: string;
  vehicleNameplate: string;
  vehicleYear: number;
  vehicleColor: string;
  carsDocument: string[];
  approved: boolean;
  status: boolean;
  service?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleDocumentsSchema = new Schema<IVehicleDocuments>(
  {
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    vehicleManufacturer: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    vehicleNameplate: { type: String, required: true },
    vehicleYear: { type: Number, required: true },
    vehicleColor: { type: String, required: true },
    carsDocument: [{ type: String }],
    approved: { type: Boolean, default: false },
    status: { type: Boolean, default: false },
    service: { type: Schema.Types.ObjectId, ref: 'Service' },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

VehicleDocumentsSchema.index({ driver: -1 });
VehicleDocumentsSchema.index({ approved: -1 });
VehicleDocumentsSchema.index({ status: -1 });
VehicleDocumentsSchema.index({ createdAt: -1 });

export const VehicleDocumentsModel = mongoose.model<IVehicleDocuments>('VehicleDocuments', VehicleDocumentsSchema, 'vehicleDocuments');
