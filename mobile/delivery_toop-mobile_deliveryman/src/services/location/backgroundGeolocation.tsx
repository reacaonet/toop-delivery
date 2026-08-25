import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import { Colors } from '../../styles';
import config from '../../config';
import { StorageSet } from '../deviceStorage';

const executeBackground = (location: any) => {
  try {
    BackgroundGeolocation.startTask(async (taskKey) => {
      BackgroundGeolocation.endTask(taskKey);
    });

    StorageSet('@location', {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy || 0,
    });
  } catch (err) {
    console.log('Hey error execute backgroud', err);
  }
};

const configureBackground = (user: any) => {
  try {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.MEDIUM_ACCURACY,
      locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
      stationaryRadius: 10,
      distanceFilter: 3,
      notificationTitle: 'GojáDelivery',
      notificationText: '',
      notificationIconColor: Colors.PRIMARY,
      debug: false,
      startOnBoot: false,
      stopOnTerminate: false,
      startForeground: false,
      notificationsEnabled: true,
      interval: 600000, //10 Minutos
      fastestInterval: 60000, // 1 Minuto
      activitiesInterval: 60000, // 1 minutos
      stopOnStillActivity: false,
      url: `${config.apiUrl}/delivery-man/update-background/${user?.deliveryMan?._id}`,
      postTemplate: {
        latitude: '@latitude',
        longitude: '@longitude',
        status: true,
      },
    });
  } catch (err) {
    //
  }
};

const configureInRoute = (user: any) => {
  try {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
      stationaryRadius: 5,
      distanceFilter: 3,
      notificationTitle: 'GojáDelivery',
      notificationText: '',
      notificationIconColor: Colors.PRIMARY,
      debug: false,
      startOnBoot: false,
      stopOnTerminate: false,
      startForeground: false,
      notificationsEnabled: true,
      interval: 15000, //15 Segundos
      fastestInterval: 10000, // 10 Segundos
      activitiesInterval: 15000, // 15 Segundos
      stopOnStillActivity: false,
      url: `${config.apiUrl}/delivery-man/update-background/${user?.deliveryMan?._id}`,
      postTemplate: {
        latitude: '@latitude',
        longitude: '@longitude',
        status: true,
      },
    });
  } catch (err) {
    //
  }
};

const backgroundOn = () => {
  try {
    BackgroundGeolocation.on('location', (location) => {
      executeBackground(location);
    });

    BackgroundGeolocation.on('background', () => {
      // console.log('[INFO] App is in background');
    });

    BackgroundGeolocation.checkStatus((status) => {
      // console.log(
      //   '[INFO] BackgroundGeolocation service is running',
      //   status.isRunning,
      // );
      // console.log(
      //   '[INFO] BackgroundGeolocation services enabled',
      //   status.locationServicesEnabled,
      // );
      // console.log(
      //   '[INFO] BackgroundGeolocation auth status: ' + status.authorization,
      // );

      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });
  } catch (err) {
    console.log('Err backgoundOn', err);
  }
};

const locationBackground = (user: any) => {
  try {
    configureBackground(user);
    backgroundOn();
  } catch (err) {
    //
  }
};

const removeBackground = () => {
  // BackgroundGeolocation.removeAllListeners('');
  BackgroundGeolocation.events.forEach((event: any) => {
    // console.log('Hey Event', event);
    BackgroundGeolocation.removeAllListeners(event);
  });

  BackgroundGeolocation.stop();
};

export { removeBackground, configureBackground, configureInRoute };
export default locationBackground;
