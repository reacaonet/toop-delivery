import api from '../../api';
import config from '../../../config/index';

/** Util */
import { queryString } from './../../../utils';

export const distanceMatrix = async (
  origins: any,
  destinations: any,
  units: any,
) => {
  try {
    if (!origins || !destinations || !units) {
      return {
        status: 400,
        message: 'Informe o payload completo',
      };
    }

    const parameters = `${queryString({
      ...{ origins, destinations, units },
      key: config.apiGeoLocation,
    })}`;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${parameters}`;

    const { data: resp } = await api.get(url);

    return {
      status: 200,
      data: resp,
    };
  } catch (err) {
    return {
      status: 400,
      message: 'Fail list directions',
      err: err?.message,
    };
  }
};

export const getDuratinAndDistance = async (origin: any, destiny: any) => {
  try {
    const coordOrigin = `${origin.latitude},${origin.longitude}`;
    const coordDestiny = `${destiny.latitude},${destiny.longitude}`;
    const response = await distanceMatrix(coordOrigin, coordDestiny, {});

    if (!response || response.status !== 200 || !response.data) {
      return null;
    }

    const { rows } = response.data;
    const element = rows[0].elements[0];
    const distance = element.distance.value; // in meters
    const duration = element.duration.value; // in seconds

    return {
      distance,
      duration,
    };
  } catch (err) {
    return null;
  }
};
