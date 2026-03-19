import api from '../../api';
import {decode} from '@googlemaps/polyline-codec';
import {timeConvert, distanceFormat} from '../../../utils';
import {isNumber} from '@turf/turf';

export const getDirection = async (params: any): Promise<any> => {
  try {
    const {data: response} = await api.post(
      '/v1/mobility/maps/direction',
      params,
    );

    if (
      !response ||
      !isNumber(!response.duration) ||
      !isNumber(!response.distance)
    ) {
      return null;
    }

    let duration = response.duration;
    let distance = response.distance;

    if (!response.overviewPolyline || !response.overviewPolyline.points) {
      return null;
    }

    let polylinPoints: any = response.overviewPolyline.points;

    let points = decode(polylinPoints);
    let coords: any = await addPoints(points);

    duration = timeConvert(duration);
    distance = distanceFormat(distance);

    return {
      coords: coords,
      duration: duration,
      distance: distance,
      steps: response?.steps || null,
    };
  } catch (err) {
    console.log('fail item', err);
    return null;
  }
};

const addPoints = async (points: any) => {
  return new Promise(async resolve => {
    let response = [];
    for await (const point of points) {
      response.push({
        latitude: point[0],
        longitude: point[1],
      });
    }

    resolve(response);
  });
};
