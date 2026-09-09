import { SettingsModel } from "../models/Settings";

export async function getPlatformFeePercent(): Promise<number> {
  const settings = await SettingsModel.findOne().lean();
  return settings?.platformFeePercentage ?? 20;
}