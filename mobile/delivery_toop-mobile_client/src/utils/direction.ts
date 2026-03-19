import {point, bearing} from '@turf/turf';
import {distanceLatLonInKm} from './index';
import {distanceFormat, timeConvert} from '../utils';

type latLng = {
  latitude: number;
  longitude: number;
};

export const positionAndAngle = async (coords: any, origin: latLng) => {
  try {
    let distMin = null;
    let position = null;
    let angle = null;
    let oldPosition = null;

    for await (const item of coords) {
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
export const getStepCurrent = async (
  steps: any,
  origin: {
    latitude: number;
    longitude: number;
  },
  minim: number = 0.13,
) => {
  try {
    if (!steps || !Array.isArray(steps) || steps.length <= 0) {
      return null;
    }

    let distMin = null;
    let distance = null;
    let duration = null;
    let pot = 0;
    let current = 0;
    let angle: any = null;

    for await (const item of steps) {
      let location = {
        latitude: item.start_location.lat,
        longitude: item.start_location.lng,
      };

      const dist = distanceLatLonInKm(location, origin);

      if (dist > minim) {
        continue;
      }

      if (!distMin || dist < distMin) {
        pot = 0;

        for await (const step of steps) {
          if (pot >= current) {
            distMin = dist;
            distance += step.distance.value;
            duration += step.duration.value;
          }

          pot++;
        }

        if (
          item?.start_location &&
          item?.end_location &&
          item?.start_location?.lat &&
          item?.end_location?.lat
        ) {
          let bearing: any = getBearing(
            {
              latitude: item?.start_location?.lat,
              longitude: item?.start_location?.lng,
            },
            {
              latitude: item?.end_location?.lat,
              longitude: item?.end_location?.lng,
            },
          );

          if (bearing !== null && isNumber(bearing)) {
            angle = bearing;
          }
        }
      }

      current++;
    }

    if (distance && duration) {
      distance = distanceFormat(distance);
      duration = timeConvert(duration);
    }

    return {
      distance: distance,
      duration: duration,
      angle: angle,
    };
  } catch (err) {
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
