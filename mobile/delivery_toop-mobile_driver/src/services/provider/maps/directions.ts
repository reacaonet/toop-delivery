import api from '../../api';
import { decode } from '@googlemaps/polyline-codec';

export const getDirection = async (params: any): Promise<any> => {
  try {
    const { data: response }: any = await api.post(
      '/v1/mobility/maps/direction',
      params,
    );

    let item: any = response.data ? response.data : response;
    let duration = '';
    let distance = '';
    let distanceMeters = 0;

    if (
      !item.routes ||
      !Array.isArray(item.routes) ||
      item.routes.length <= 0
    ) {
      return null;
    }

    if (
      !item.routes[0].overview_polyline ||
      !item.routes[0].overview_polyline.points
    ) {
      return null;
    }

    let polylinPoints: any = item.routes[0].overview_polyline.points;

    let points = decode(polylinPoints);
    let coords: any = await addPoints(points);

    if (
      item.routes[0].legs &&
      Array.isArray(item.routes[0].legs) &&
      item.routes[0].legs.length > 0
    ) {
      duration = item.routes[0].legs[0].duration.text;
      distance = item.routes[0].legs[0].distance.text;
      if (item.routes[0].legs[0]?.distance?.value) {
        distanceMeters = Number(item.routes[0].legs[0].distance.value);
      }
    }

    return {
      coords: coords,
      duration: duration,
      distance: distance,
      distanceMeters: distanceMeters,
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
