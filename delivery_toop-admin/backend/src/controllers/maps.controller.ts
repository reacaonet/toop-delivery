import { Request, Response, NextFunction } from 'express';
import mapsService from '../services/maps.service';

export class MapsController {
  private ok(res: Response, data: any, status = 200) {
    return res.status(status).json({ success: true, data });
  }

  direction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { origin, destiny, additionalStops } = req.body || {};
      let waypoints = '';
      if (additionalStops && `${additionalStops}`.length > 5) {
        waypoints = `${additionalStops}`.replace(/\|$/, '');
      }
      const response = await mapsService.directions(origin, destiny, waypoints);
      if (response && response.status === 400) {
        return res.status(400).json({ success: false, message: response.message });
      }
      this.ok(res, response);
    } catch (e) {
      next(e);
    }
  };

  matrix = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { origin, destiny } = req.body || {};
      const response = await mapsService.distanceMatrix(origin, destiny, 'metric');
      if (response && response.status === 400) {
        return res.status(400).json({ success: false, message: response.message });
      }
      this.ok(res, response);
    } catch (e) {
      next(e);
    }
  };

  geo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { latitude, longitude, placeId } = req.body || {};
      let geoResponse: any = null;
      if (latitude && longitude) {
        geoResponse = await mapsService.geoCode(latitude, longitude);
      } else if (placeId) {
        geoResponse = await mapsService.geoCodePlaceId(placeId);
      }
      if (!geoResponse || !geoResponse.address) {
        return res.status(400).json({ success: false, message: 'Não foi possível verificar o endereço atual' });
      }
      geoResponse.shortAddress = geoResponse.street !== '-' ? geoResponse.street : geoResponse.address;
      if (latitude && longitude) {
        geoResponse.latitude = latitude;
        geoResponse.longitude = longitude;
      }
      this.ok(res, geoResponse);
    } catch (e) {
      next(e);
    }
  };

  complete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { address } = req.body || {};
      if (!address) {
        return res.status(400).json({ success: false, message: 'Insira os dados corretamente' });
      }
      this.ok(res, await mapsService.autoComplete(address));
    } catch (e) {
      next(e);
    }
  };
}

export default new MapsController();
