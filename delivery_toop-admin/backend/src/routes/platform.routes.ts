import { Router } from "express";
import { SettingsModel } from "../models/Settings";

const router = Router();

const DEFAULT_CONTACT = {
  supportEmail: "contato@gojadelivery.app.br",
  supportPhone: "(00) 0000-0000",
  whatsapp: "+5500000000000",
  website: "https://gojadelivery.app.br",
  supportHours: "Seg a Sex, 8h às 18h",
};

router.get("/contact", async (_req, res, next) => {
  try {
    let settings = await SettingsModel.findOne().lean();
    if (!settings) {
      await SettingsModel.create({});
      settings = await SettingsModel.findOne().lean();
    }
    const contact = { ...DEFAULT_CONTACT, ...(settings!.contact || {}) };
    Object.keys(DEFAULT_CONTACT).forEach((key) => {
      if (!contact[key]) contact[key] = DEFAULT_CONTACT[key];
    });
    return res.status(200).json({
      success: true,
      data: {
        contact: contact || DEFAULT_CONTACT,
        pushNotifications: settings!.pushNotifications,
        maintenanceMode: settings!.maintenanceMode,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
