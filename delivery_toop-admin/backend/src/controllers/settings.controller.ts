import { Request, Response, NextFunction } from "express";
import { SettingsModel } from "../models/Settings";

class SettingsController {
  async get(_req: Request, res: Response, next: NextFunction) {
    try {
      let settings = await SettingsModel.findOne();
      if (!settings) {
        settings = await SettingsModel.create({});
      }
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      let settings = await SettingsModel.findOne();
      if (!settings) {
        settings = await SettingsModel.create(req.body);
      } else {
        // merge profundo do paymentGateway para não perder credenciais em PUT parcial
        if (req.body.paymentGateway && typeof req.body.paymentGateway === 'object') {
          req.body.paymentGateway = {
            ...(settings.paymentGateway ? (settings.paymentGateway as any).toObject() : {}),
            ...req.body.paymentGateway,
          };
        }
        Object.assign(settings, req.body);
        await settings.save();
      }
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }
}

export default new SettingsController();
