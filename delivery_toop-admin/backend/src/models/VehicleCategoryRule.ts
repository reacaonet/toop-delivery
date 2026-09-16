import mongoose, { Schema, InferSchemaType } from "mongoose";

const vehicleCategoryRuleSchema = new Schema(
  {
    brand: { type: String, trim: true, lowercase: true, default: "" },
    model: { type: String, trim: true, lowercase: true, default: "" },
    yearMin: { type: Number, default: null },
    yearMax: { type: Number, default: null },
    category: { type: String, required: true, index: true },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type IVehicleCategoryRule = InferSchemaType<typeof vehicleCategoryRuleSchema>;

export const VehicleCategoryRuleModel = mongoose.model<IVehicleCategoryRule>(
  "VehicleCategoryRule",
  vehicleCategoryRuleSchema
);