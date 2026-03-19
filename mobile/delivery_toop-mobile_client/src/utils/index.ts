import {PixelRatio, Platform} from 'react-native';
import moment from 'moment';
import 'moment/locale/pt-br';
import Toast from 'react-native-tiny-toast';
// import Geolocation from '@react-native-community/geolocation';
import Geolocation from 'react-native-geolocation-service';
import {Colors} from '../styles';

/** Services */
import LocationPermission from '../services/permissions/locationPermission';

/** Translate */
import i18next from '../locales';

const validateEmail = (email: string) => {
  var re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const queryString = (params: any) => {
  try {
    let getQuery = '';
    if (params && params !== undefined) {
      getQuery = Object.keys(params)
        .map(function (key) {
          return key + '=' + params[key];
        })
        .join('&');
    }

    return getQuery;
  } catch (err) {
    return '';
  }
};

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

const formatMoney = (amount: any, Symbol: any = null) => {
  try {
    let money = formatterAmount(amount);
    money = `${money || ''}`.replace('.', ',');

    if (
      Symbol === false ||
      Symbol === '' ||
      Symbol === undefined ||
      Symbol === null
    ) {
      return `${money}`;
    }

    return `${Symbol} ${money}`;
  } catch (err) {
    console.log('fail', err);
    return '';
  }
};

export const calculateRideArriveTime = (minutes: any) => {
  // console.log('minutes', minutes);
  const numberMinutes = minutes.split(' ')[0];
  const momentTime = moment();
  const arriveTime = momentTime.add(numberMinutes, 'minutes');
  return `Chegada ao destino: ${arriveTime.format('HH:mm')}`;
};

const capitalize = s => {
  if (typeof s !== 'string') {
    return s;
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatDate = (date: any, format: any) => {
  try {
    let dateF = moment(date, 'YYYY-MM-DD hh:mm:ss')
      .subtract(3, 'hours')
      .locale('pt-br')
      .format(format);

    if (dateF === 'Invalid date' || dateF === undefined) {
      return '';
    }

    return dateF;
  } catch (err) {
    return '';
  }
};

const hoursBase10 = (hour: any) => {
  try {
    let str = `${hour}`;
    let size = str.length;
    if (size === 3) {
      return '0' + str.substr(0, 1) + ':' + str.substr(1, size);
    }

    return str.substr(0, 2) + ':' + str.substr(2, size);
  } catch (err) {
    console.log('Error', err);
    return '';
  }
};

const chunkSubstr = (str: any, size: any) => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);
  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }
  return chunks;
};

const toastShow = (msg: any, type = 'DEFAULT', duration = 8000) => {
  try {
    let background = Colors.PRIMARY;
    switch (type) {
      case 'DEFAULT':
        background = Colors.PRIMARY;
        break;
      case 'ALERT':
        background = Colors.ALERT;
        break;
      case 'WARN':
        background = Colors.SECONDARY;
        break;
      default:
        background = Colors.PRIMARY;
    }

    Toast.show(msg, {
      position: Toast.position.TOP,
      containerStyle: {
        zIndex: 100,
        position: 'absolute',
        marginHorizontal: 20,
        top: 10,
        backgroundColor: background,
        borderRadius: 15,
      },
      textStyle: {color: Colors.WHITE},
      mask: false,
      maskStyle: {},
      duration: duration,
      animation: true,
    });
  } catch (err) {
    console.log('fail toastShow', err);
  }
};

const replaceSpecialChars = (str: any) => {
  return `${str || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/([^\w]+|\s+)/g, '') // Substitui espaço e outros caracteres por hífen
    .replace(/\-\-+/g, '') // Substitui multiplos hífens por um único hífen
    .replace(/(^-+|-+$)/, ''); // Remove hífens extras do final ou do inicio da string
};

const formatDateFromNow = (date: any) => {
  try {
    let dataCurrent = moment(date);
    let dateFormat = dataCurrent.locale('pt-br').fromNow();
    return dateFormat;
  } catch (err) {
    return '';
  }
};

const formatPhone = (number: any) => {
  let cleaned = ('' + `${number || ''}`).replace(/\D/g, '');

  if (!cleaned) {
    return number;
  }

  let match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);

  if (!match) {
    return cleaned;
  } else {
    return `${match[1]}${match[2]}${match[3]}`;
  }
};

function round(value: any, precision: any) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

function getPixelSize(pixels: any) {
  return Platform.select({
    ios: pixels,
    android: PixelRatio.getPixelSizeForLayoutSize(pixels),
  });
}

async function getCurrentPosition(setLocation: Function | null = null) {
  let isPermission = await LocationPermission().isPermission();

  if (isPermission === false) {
    isPermission = await LocationPermission().setPermission();
  }

  let enableHighAccuracy = isPermission;

  return new Promise((resolve, _reject) => {
    Geolocation.getCurrentPosition(
      ({coords: {latitude, longitude, altitude}}) => {
        if (setLocation) {
          setLocation({
            latitude,
            longitude,
            latitudeDelta: 0.0143,
            longitudeDelta: 0.0134,
            altitude,
          });
        }

        return resolve({
          latitude,
          longitude,
          latitudeDelta: 0.0143,
          longitudeDelta: 0.0134,
          altitude,
        });
      },
      err => {
        console.log('err getCurrentPosition', err);
        return resolve({
          latitude: 0,
          longitude: 0,
          latitudeDelta: 0.0143,
          longitudeDelta: 0.0134,
        });
      },
      {
        timeout: 20000,
        enableHighAccuracy: enableHighAccuracy,
        maximumAge: 3000,
        accuracy: {
          android: 'high',
          ios: 'nearestTenMeters',
        },
      },
    );
  });
}

function formatAddress(delivery: any) {
  try {
    let address = delivery ? delivery : delivery?.address;
    let strAddress = '';

    if (delivery?.addressRoute && delivery?.addressRoute.length > 3) {
      strAddress = delivery.addressRoute;

      if (delivery?.streetNumber) {
        strAddress += ` ${delivery?.streetNumber}`;
      }

      if (delivery?.city) {
        strAddress += ` ${delivery?.city}`;
      }

      if (delivery?.state) {
        strAddress += ` ${delivery?.state}`;
      }
    } else if (delivery?.address) {
      address = delivery?.address;
    }

    return strAddress === '' ? address : strAddress;
  } catch (err) {
    return ' - ';
  }
}

export const getRideMinutes = (seconds: number) => {
  if (seconds < 60) {
    let sec = `${seconds}`.padStart(2, '0');
    return `00:${sec}`;
  }

  let minutes: any = parseInt(`${Number(seconds / 60)}`, 10);

  let secondsLeft: any = 0;
  secondsLeft = seconds - minutes * 60;
  minutes = `${minutes}`.padStart(2, '0');

  secondsLeft = `${secondsLeft}`.padStart(2, '0');
  return `${minutes}:${secondsLeft}`;
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

    const {latitude: lat1, longitude: lon1} = centerCoordinates;
    const {latitude: lat2, longitude: lon2} = pointCoordinates;

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
  try {
    seconds = Number(seconds);

    let m: any = Math.floor((seconds % 3600) / 60);

    if (m < 1) {
      m = '1';
    }

    return `${m} min`;
  } catch (err) {
    return ' - ';
  }
}

export function distanceFormat(meters: number) {
  try {
    meters = Number(meters);

    let km: Number = meters / 1000;
    let kmFormat: any = km.toFixed(2);

    return `${kmFormat} KM`;
  } catch (err) {
    return ' - ';
  }
}

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

export const sleep = (seconds: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, seconds * 1000);
  });
};

export {
  validateEmail,
  queryString,
  capitalize,
  formatterAmount,
  formatDate,
  hoursBase10,
  chunkSubstr,
  toastShow,
  formatMoney,
  replaceSpecialChars,
  formatDateFromNow,
  formatPhone,
  round,
  getPixelSize,
  getCurrentPosition,
  formatAddress,
};
