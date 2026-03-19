// /* eslint-disable prefer-const */
// import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
// import { AppState } from 'react-native';
// import { Colors } from '../../styles';
// import config from '../../config';

// var dispatch: any = null;
// var user: any = null;

// const executeBackground = (location: any) => {
//   try {
//     if (location && location.latitude && location.longitude) {
//       // console.log('executeBackground', location);

//       if (AppState.currentState === 'active') {
//         dispatch({
//           type: 'SET_LOCATION_SAGA',
//           payload: {
//             location: location,
//             user: user,
//           },
//           disableUpdate: true,
//         });
//       }
//     }

//     BackgroundGeolocation.startTask(async taskKey => {
//       BackgroundGeolocation.endTask(taskKey);
//     });
//   } catch (err) {
//     console.log('Hey error execute backgroud', err);
//   }
// };

// export const configureBackground = (uid: string) => {
//   try {
//     const postTemplate: any = {
//       latitude: '@latitude',
//       longitude: '@longitude',
//       uid: uid,
//       backgroundPosition: true,
//     };

//     if (config.applicationId && config.applicationId !== '') {
//       postTemplate.applicationId = config.applicationId;
//     }

//     BackgroundGeolocation.configure({
//       desiredAccuracy: BackgroundGeolocation.MEDIUM_ACCURACY,
//       locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
//       stationaryRadius: 50,
//       distanceFilter: 50,
//       notificationTitle: 'Você está online',
//       notificationText: '',
//       notificationIconColor: Colors.PRIMARY,
//       debug: false,
//       startOnBoot: false,
//       stopOnTerminate: false,
//       startForeground: true,
//       notificationsEnabled: true,
//       interval: 600000, // 10 Minutos
//       fastestInterval: 60000, // 1 Minuto
//       activitiesInterval: 60000, // 1 minutos
//       stopOnStillActivity: false,
//       url: `${config.apiUrl}/v1/mobility/driver/background/${uid}`,
//       postTemplate: postTemplate,
//     });
//   } catch (err) {
//     //
//   }
// };

// export const configureInRoute = (driverId: string, bookingId: string) => {
//   try {
//     const postTemplate: any = {
//       latitude: '@latitude',
//       longitude: '@longitude',
//       driver: driverId,
//       booking: bookingId,
//       backgroundPosition: true,
//     };

//     if (config.applicationId && config.applicationId !== '') {
//       postTemplate.application = config.applicationId;
//     }

//     BackgroundGeolocation.configure({
//       desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
//       // locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
//       locationProvider: BackgroundGeolocation.RAW_PROVIDER,
//       stationaryRadius: 7,
//       distanceFilter: 5,
//       notificationTitle: 'Você está em rota',
//       notificationText: '',
//       notificationIconColor: Colors.PRIMARY,
//       debug: false,
//       startOnBoot: false,
//       stopOnTerminate: false,
//       startForeground: true,
//       notificationsEnabled: true,
//       interval: 1800, // 1,8 Segundos
//       fastestInterval: 1800, // 1,8 Segundos
//       activitiesInterval: 1800, // 1,8 Segundos
//       stopOnStillActivity: false,
//       url: `${config.apiUrl}/v1/mobility/driver/background/${driverId}`,
//       postTemplate: postTemplate,
//     });
//   } catch (err) {
//     //
//   }
// };

// const backgroundOn = () => {
//   try {
//     BackgroundGeolocation.on('location', location => {
//       executeBackground(location);
//     });

//     BackgroundGeolocation.on('background', () => {
//       // console.log('[INFO] App is in background');
//     });

//     BackgroundGeolocation.checkStatus(status => {
//       // console.log(
//       //   '[INFO] BackgroundGeolocation service is running',
//       //   status.isRunning,
//       // );
//       // console.log(
//       //   '[INFO] BackgroundGeolocation services enabled',
//       //   status.locationServicesEnabled,
//       // );
//       // console.log(
//       //   '[INFO] BackgroundGeolocation auth status: ' + status.authorization,
//       // );

//       if (!status.isRunning) {
//         BackgroundGeolocation.start(); // triggers start on start event
//       }

//       // if (status.isRunning) {
//       //   console.log('Iniciando de novo ....')
//       //   BackgroundGeolocation.start()
//       // }
//     });
//   } catch (err) {
//     console.log('Err backgoundOn', err);
//   }
// };

// export const startLocationBackground = async (
//   userDriver: any,
//   bookingId: string,
//   dispat: any,
// ) => {
//   try {
//     dispatch = dispat;
//     user = userDriver;

//     // configureBackground(uid)
//     configureInRoute(userDriver?._id, bookingId);
//     backgroundOn();
//   } catch (err) {
//     console.log('Fail startLocationBackground', err);
//   }
// };

// export const stopLocationBackground = async () => {
//   try {
//     BackgroundGeolocation.events.forEach(event => {
//       BackgroundGeolocation.removeAllListeners(event);
//     });

//     BackgroundGeolocation.stop();
//   } catch (err) {
//     console.log('err stopLocationBackground:', err);
//     //
//   }
// };
