import BackgroundService from 'react-native-background-actions';
import RNLocation from 'react-native-location';
import { Platform, NativeModules } from 'react-native';
const { OpenApp } = NativeModules;

/** Service */
import api from '../api';
import { StorageGet, StorageSet } from '../deviceStorage';
import i18next from '../../locales';

/** Config */
import config from '../../config';
const packageJson = require('../../../package.json');

import { Colors } from '../../styles';

/** Util */
import { distanceLatLonInKm } from '../../utils';

const time = 45000;
const timeTravel = 10000;

const options = {
  taskName: i18next.t('background.location'),
  taskTitle: i18next.t('background.backgroundService'),
  taskDesc: i18next.t('background.youOnline'),
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
    package: `${config.PACKAGE}`,
  },
  color: Colors.PRIMARY,
  linkingURI: `${config.PACKAGE}://app`,
  parameters: {
    delay: time,
  },
};

RNLocation.configure({
  distanceFilter: 0,
  fastestInterval: 5000,
  allowsBackgroundLocationUpdates: true,
});

const sleep = (time: number) =>
  new Promise(resolve => setTimeout(() => resolve(true), time));

export const startBackground = async () => {
  try {
    console.log('startBackground isRunning', BackgroundService.isRunning());

    if (!BackgroundService.isRunning()) {
      await BackgroundService.start(startTask, options);
    }
  } catch (err) {
    console.log('err startNotifeeBackground', err);
  }
};

export const updateBackground = async () => {
  try {
    const bookingCurrent = await StorageGet('@bookingCurrentLocation');

    if (Platform.OS === 'android') {
      OpenApp.updateTimeLocation(bookingCurrent ? true : false, 0);

      const isRunning = await OpenApp.getBackgroundLocationServiceRunning();
      if (!isRunning) {
        OpenApp.startLocation();
      }
    } else {
      if (bookingCurrent) {
        options.parameters = {
          delay: timeTravel,
        };
      } else {
        options.parameters = {
          delay: time,
        };
      }

      options.taskDesc = bookingCurrent
        ? i18next.t('background.onTrip')
        : i18next.t('background.youOnline');

      await BackgroundService.start(startTask, options);
    }
  } catch (err) {
    console.log('fail updateBackground', err);
  }
};

export const stopBackground = async () => {
  try {
    if (Platform.OS === 'android') {
      const isRunning = await OpenApp.getBackgroundLocationServiceRunning();

      if (isRunning) {
        return OpenApp.stopLocation();
      }
      return;
    }

    BackgroundService.removeAllListeners();
    await BackgroundService.stop();
  } catch (err) {
    console.log('stopNotifeeBackground', err);
  }
};

const startTask = async (taskDataArguments: any) => {
  try {
    console.log('taskDataArguments -----', taskDataArguments);

    const { delay } = taskDataArguments;

    await new Promise(async () => {
      for (let i = 0; BackgroundService.isRunning(); i++) {
        await startLocation();
        await sleep(delay);
      }
    });
  } catch (err) {
    console.log('startTask err', err);
  }
};

export const startLocation = async () => {
  try {
    const granted = await RNLocation.requestPermission({
      ios: 'whenInUse',
      android: {
        detail: 'fine',
      },
    });

    if (granted) {
      const location = await RNLocation.getLatestLocation();
      if (location && location?.latitude && location?.longitude) {
        const bookingCurrent = await StorageGet('@bookingCurrentLocation');
        const authUser: any = await StorageGet(config.tokenAuth);

        const payload: any = {
          booking: bookingCurrent?._id,
          driver: authUser._id,
          latitude: location?.latitude,
          longitude: location?.longitude,
        };

        if (config.applicationId && config.applicationId !== '') {
          payload.applicationId = config.applicationId;
          payload.application = config.applicationId;
        }

        const postTemplate: any = [payload];

        const { data: response } = await api.post(
          `${config.apiUrl}/v1/mobility/driver/background/${authUser._id}`,
          postTemplate,
        );

        // console.log('response', response);
      }
    }
  } catch (err) {
    console.log('fail startLocation', err);
  }
};

export const startLocationNative = async (vLocation: any) => {
  if (!vLocation) {
    return;
  }

  try {
    const loc = JSON.parse(vLocation);
    const locList = [];

    for (const item of loc) {
      var vLocation = item.split(',');
      let speed = 0;

      if (vLocation && Array.isArray(vLocation) && vLocation.length >= 3) {
        speed = vLocation[3];
      }

      const latLong: any = {
        lat: vLocation[1],
        lng: vLocation[0],
        localDate: vLocation[2],
        speed: speed,
      };

      locList.push(latLong);
    }

    const granted = await RNLocation.requestPermission({
      ios: 'whenInUse',
      android: {
        detail: 'fine',
      },
    });

    // console.log('message ENVIANDO startLocationNative 2');
    if (granted) {
      // console.log('message ENVIANDO startLocationNative 3');
      const location = locList;

      if (location && typeof location === 'object') {
        // console.log('message ENVIANDO startLocationNative 4');
        const bookingCurrent = await StorageGet('@bookingCurrentLocation');
        const authUser: any = await StorageGet(config.tokenAuth);

        const payloadList = [];

        for (const locItem of location) {
          const payload: any = {
            booking: bookingCurrent?._id,
            driver: authUser._id,
            latitude: locItem?.lat,
            longitude: locItem?.lng,
            localDate: locItem?.localDate,
            speed: locItem?.speed,
          };

          if (config.applicationId && config.applicationId !== '') {
            payload.applicationId = config.applicationId;
            payload.application = config.applicationId;
          }

          payloadList.push(payload);
        }

        // console.log('o que será enviado', payloadList);

        const { data: response } = await api.post(
          `${config.apiUrl}/v1/mobility/driver/background/${authUser._id}`,
          payloadList,
        );

        console.log('message ENVIANDO startLocation response', response);
      }
    }
  } catch (err) {
    console.log('message ENVIANDO fail startLocation', err);
  }
};

export const updateLocation = async (coord: any, dispatch: any) => {
  try {
    const isOnCoordinate = await StorageGet('onCoordinate');

    if (`${isOnCoordinate}` === 'true') {
      return;
    }

    await StorageSet('onCoordinate', 'true');
    const latLng = coord.split(',');
    const latitude = latLng[0] || 0;
    const longitude = latLng[1] || 0;

    const locCurrent: any = await StorageGet('@location');
    const userCurrent: any = await StorageGet(config.tokenAuth);
    let dist: any = null;

    if (userCurrent && userCurrent._id) {
      if (locCurrent && locCurrent?.latitude && latitude && longitude) {
        dist = distanceLatLonInKm(locCurrent, {
          latitude,
          longitude,
        });

        if (dist >= 0) {
          dist = dist * 1000; // em metros
        }
      }

      if (dist === null || dist >= 15) {
        // console.log('nova coordenada Distancia: ', dist);
        dispatch({
          type: 'SET_LOCATION_SAGA',
          payload: {
            location: {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            },
            user: null,
          },
        });
      }
    }

    await StorageSet('onCoordinate', 'false');
  } catch (err) {
    await StorageSet('onCoordinate', 'false');
  }
};
