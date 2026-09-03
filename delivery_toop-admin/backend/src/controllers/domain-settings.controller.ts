import { Request, Response, NextFunction } from 'express';
import domainSettingsService from '../services/domain-settings.service';

export class DomainSettingsController {
  /* State */
  async listStates(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.listStates(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async listStatesByNome(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.listStateByNome(req.query.listPorNome as string);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createState(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.createState(req.body);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateState(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.updateState(req.params.id, req.body);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async removeState(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.removeState(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /* City */
  async listCities(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.listCities(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async paginateCities(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.paginateCities(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async normalizeCities(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.normalizeCities();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createCity(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.createCity(req.body);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateCity(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.updateCity(req.params.id, req.body);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async removeCity(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.removeCity(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /* TypesUsers */
  async listTypesUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.listTypesUsers(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async paginateTypesUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.paginateTypesUsers(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createTypesUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.createTypesUsers(req.body);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateTypesUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.updateTypesUsers(req.params.id, req.body);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async removeTypesUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.removeTypesUsers(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /* AppVersion */
  async listAppVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.listAppVersions();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createAppVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.createAppVersion(req.body);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async checkAppVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.checkAppVersion(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /* TimeZone */
  async listTimeZones(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.listTimeZones();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /* Countries */
  async listCountries(req: Request, res: Response, next: NextFunction) {
    try {
      const data = domainSettingsService.listCountries(req.query.language as string);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /* App/:franchise */
  async appSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.appSettings(req.params.franchise);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /* Brazilian Banks */
  async listBrazilianBanks(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.listBrazilianBanks(req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /* GlobalSettings */
  async getGlobalSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await domainSettingsService.getGlobalSettings();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export default new DomainSettingsController();
