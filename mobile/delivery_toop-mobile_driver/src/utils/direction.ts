import { point, bearing } from '@turf/turf';
import { distanceLatLonInKm } from './index';

type latLng = {
  latitude: number;
  longitude: number;
};

export const positionAndAngle = async (
  coords: any,
  origin: {
    latitude: number;
    longitude: number;
  },
) => {
  try {
    let distMin = null;
    let position = null;
    let angle = null;
    let oldPosition = null;
    // let indice = 0;
    // const totalIndice = coords.length;

    for await (const item of coords) {
      // let nextCoord = null;
      // if (indice < totalIndice) {
      //   nextCoord = item;
      // }

      const dist = distanceLatLonInKm(
        {
          latitude: item.latitude,
          longitude: item.longitude,
        },
        origin,
      );

      if (dist < 0.2) {
        if (!distMin || dist < distMin) {
          distMin = dist;
          position = item;

          if (oldPosition) {
            const point1 = point([oldPosition.latitude, oldPosition.longitude]);
            const point2 = point([item.latitude, item.longitude]);
            angle = bearing(point1, point2);
          } else {
            const point1 = point([origin.latitude, origin.longitude]);
            const point2 = point([item.latitude, item.longitude]);
            angle = bearing(point1, point2);
          }
        }
      }

      oldPosition = item;
      // indice++;
    }

    return {
      distance: distMin,
      position: position,
      angle: angle,
    };
  } catch (err) {
    console.log('not position and angle', err);
    return null;
  }
};

export const getBearing = (origin: latLng, destiny: latLng) => {
  try {
    const point1 = point([origin.latitude, origin.longitude]);
    const point2 = point([destiny.latitude, destiny.longitude]);

    const angle = bearing(point1, point2);
    return angle;
  } catch (err) {
    console.log('err getBearing', err);
    return null;
  }
};
