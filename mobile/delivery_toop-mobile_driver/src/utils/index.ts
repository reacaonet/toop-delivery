/** Translate */
import moment from 'moment';
import i18next from '../locales';

const formatterAmount = (amount: any) => {
  try {
    const number = amount.toFixed(2);

    if (number >= 0) {
      return number.replace(/\d(?=(\d{3})+\.)/g, '$&,');
    } else if (number < 0) {
      return (number * -1).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    return '';
  } catch (err) {
    return amount;
  }
};

export const formatMoney = (amount: number | String, symbol = '') => {
  try {
    if (amount === '' || amount === undefined || amount === null) {
      return '';
    }

    let money = formatterAmount(amount);
    money = money.replace('.', ',');

    if (amount < 0) {
      if (symbol && typeof symbol === 'string') {
        return `- ${symbol} ${money}`;
      }

      return `${money}`;
    }

    if (symbol && typeof symbol === 'string') {
      return `${symbol} ${money}`;
    }

    return `${money}`;
  } catch (err) {
    console.log('fail formatMoney', err);
    return '';
  }
};

export const calculateRideArriveTime = (minutes: string) => {
  // console.log('minutes', minutes);
  const numberMinutes = minutes.split(' ')[0];
  const momentTime = moment();
  const arriveTime = momentTime.add(numberMinutes, 'minutes');
  /*   console.log('hora antes', momentTime.format('HH:mm'));
  console.log('', momentTime.add(numberMinutes, 'minutes').format);
  console.log('hora depois', momentTime.format('HH:mm')); */
  // return `Chegada ao destino: ${arriveTime.format('HH:mm')}`;
  return `${i18next.t(
    'confirmRideScreen.arrivalDestination',
  )}: ${arriveTime.format('HH:mm')}`;
};

export function maskDateToPt(date: string) {
  if (!date) {
    return '';
  }

  const v = date.replace(/\D/g, '');
  return v.substr(0, 8).replace(/(\d{2})(\d{2})(\d{4})/g, '$1/$2/$3');
}

export const maskCpfCnpj = (target: string, type = 'cpf') => {
  let targetF = clearMask(target);

  if (parseInt(target)) {
    if (targetF.toString().length === 11) {
      return maskCpf(targetF.toString());
    } else {
      return maskCnpj(targetF.toString().substr(0, 14));
    }
  } else {
    return target;
  }
};

export const maskNIF = (target: string) => {
  let targetF = clearMask(target);

  if (`${targetF}`.length > 9) {
    return `${targetF}`.slice(0, 9);
  }

  return targetF;
};

export function clearMask(target: string) {
  return target.replace(/\D/g, '');
}
function maskCpf(value: string) {
  return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
}
function maskCnpj(value: string) {
  return value.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,
    '$1.$2.$3/$4-$5',
  );
}

export const queryString = (params: any) => {
  try {
    let getQuery = '';
    if (params && params !== undefined) {
      getQuery = Object.keys(params)
        .map(function (key) {
          return key + '=' + encodeURIComponent(params[key]);
        })
        .join('&');
    }

    return getQuery;
  } catch (err) {
    return '';
  }
};

export const round = (value: any, precision: number) => {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
};

export const quaternionToAngles = (q: any) => {
  try {
    let data = q;

    let ysqr = data.qy * data.qy;
    let t0 = -2.0 * (ysqr + data.qz * data.qz) + 1.0;
    let t1 = +2.0 * (data.qx * data.qy + data.qw * data.qz);
    let t2 = -2.0 * (data.qx * data.qz - data.qw * data.qy);
    let t3 = +2.0 * (data.qy * data.qz + data.qw * data.qx);
    let t4 = -2.0 * (data.qx * data.qx + ysqr) + 1.0;

    t2 = t2 > 1.0 ? 1.0 : t2;
    t2 = t2 < -1.0 ? -1.0 : t2;

    const toDeg = 180 / Math.PI;

    const euler: any = {};
    euler.pitch = Math.asin(t2) * toDeg;
    euler.roll = Math.atan2(t3, t4) * toDeg;
    euler.yaw = Math.atan2(t1, t0) * toDeg;

    return euler;
  } catch (err) {
    return null;
  }
};

const deg2rad = (deb: number) => {
  return deb * (Math.PI / 180);
};

export const distanceLatLonInKm = (
  centerCoordinates: any,
  pointCoordinates: any,
) => {
  try {
    const radius = 6371;

    const { latitude: lat1, longitude: lon1 } = centerCoordinates;
    const { latitude: lat2, longitude: lon2 } = pointCoordinates;

    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const center = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = radius * center;
    return Number(distance);
  } catch (err) {
    return '';
  }
};

export function timeConvert(seconds: number) {
  seconds = Number(seconds);
  var h = Math.floor(seconds / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  // var s = Math.floor((seconds % 3600) % 60);

  var hDisplay = h.toString().padStart(2, '0');
  var mDisplay = m.toString().padStart(2, '0');
  // var sDisplay =
  //   s > 0
  //     ? s.toString().padStart(2, '0') + (s == 1 ? ' second' : ' seconds')
  //     : '';
  return `${hDisplay}:${mDisplay}`;
}

export const distanceCurrentRace = (
  itemAdditionalStops: any,
  driverLocation: any,
  itemDestiny: any,
  status: string,
) => {
  let distanceKm: any = 0;

  if (
    status === 'in_progress' &&
    itemAdditionalStops &&
    itemAdditionalStops.length > 0
  ) {
    itemAdditionalStops.map((item: any, key: number) => {
      if (key === 0) {
        distanceKm += distanceLatLonInKm(item, driverLocation?.location);
      } else {
        distanceKm += distanceLatLonInKm(item, itemAdditionalStops[key - 1]);
      }
    });

    distanceKm += distanceLatLonInKm(
      itemAdditionalStops[itemAdditionalStops.length - 1],
      itemDestiny,
    );
  } else {
    distanceKm = distanceLatLonInKm(itemDestiny, driverLocation?.location);
  }

  return distanceKm;
};

export const maskRealBeautify = (
  int: any,
  includeZero = false,
  symbol = '',
) => {
  if (!int) {
    int = 0;
  }

  let isNegative = false;

  if (int < 0) {
    isNegative = true;
  }

  if (includeZero) {
    int = parseFloat(int).toFixed(2);
  }

  int = int.toString().replace(/\D/g, '');

  int = new String(Number(int));

  var len = int.length;

  if (len == 1) {
    int = int.replace(/(\d)/, '0,0$1');
  } else if (len == 2) {
    int = int.replace(/(\d)/, '0,$1');
  } else if (len > 2 && len < 6) {
    int = int.replace(/(\d{2})$/, ',$1');
  } else if (len >= 6 && len < 9) {
    int = int.replace(/(\d{3})(\d{2})$/, '.$1,$2');
  } else if (len >= 9) {
    int = int.replace(/(\d{3})(\d{3})(\d{2})$/, '.$1.$2,$3');
  }

  return `${symbol ? `${symbol} ` : ''}${isNegative ? `- ${int}` : int}`;
};

export const perKm = (price: number, distance: string) => {
  return price / parseFloat(distance);
};

export const dinamicCalc = (percent: any) => {
  percent / 100 + 1;
  return Number(percent).toFixed(1);
};
