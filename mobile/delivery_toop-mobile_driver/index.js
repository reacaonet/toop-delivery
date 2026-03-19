import React from 'react';
import {
  Alert,
  AppRegistry,
  Linking,
  NativeModules,
  Platform,
  DeviceEventEmitter,
} from 'react-native';

import { Provider } from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import App from './src/App';
import store from './src/store/storeConfig';
import { name as appName } from './app.json';
import config from './src/config';
import { refusedBooking } from './src/services/provider/booking/cancel';
import { acceptRace } from './src/services/provider/booking/acceptRace';
import { ActiverRun } from './src/services/provider/booking/activeRun';
import database from '@react-native-firebase/database';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer from 'react-native-track-player';
import 'react-native-gesture-handler';
import notifee, {
  AndroidColor,
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';

Icon.loadFont();
const { OpenApp } = NativeModules;

/** Services */
import {
  onRegisterPlayback,
  startSoundNotification,
} from './src/services/TrackPlayer/soundNotification';
/** Service */
import { StorageGet } from './src/services/deviceStorage';
import drawOverlays from './src/services/permissions/drawOverlays';

/** Component */
import SandBox from './src/components/Button/sandBox';

/** Contexto */
import { SettingsProvider } from './src/context/settings';

var bookingId;
var userId;

const onSessionAcceptRace = event => {
  try {
    acceptRaceClick();
  } catch (err) {}
};

const onSessionRefused = event => {
  try {
    refusedClick();
  } catch (err) {}
};

function refusedClick() {
  stopSound();
  removeNotification();

  refusedBooking(bookingId, userId);
}

async function acceptRaceClick() {
  stopSound();
  var response = await acceptRace({
    driverId: userId,
    bookingId: bookingId,
  });

  if (response && response.errMessage) {
    return Alert.alert('Nova Solicitação', response?.errMessage || '');
  }

  removeNotification();

  ActiverRun(userId).then(result => {
    OpenApp.invokeAppNewRace();
    var dispatch = useDispatch();
    if (result && Array.isArray(result) && result.length > 0) {
      dispatch({
        type: 'UPDATE_BOOKING_SAGA',
        payload: {
          status: result[0].status,
          booking: result,
        },
      });
    } else if (result && Array.isArray(result) && result.length === 0) {
      dispatch({
        type: 'CLEAN_BOOKING_SAGA',
      });
    }
  });
}

export const stopSound = async () => {
  try {
    await TrackPlayer.reset();
  } catch (err) {}
};

const removeNotification = async () => {
  database().ref(`${config.FIREBASE_PATH}booking/driver/${userId}`).remove();
};

messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    if (remoteMessage?.data && remoteMessage?.data?.bookingId) {
      // Linking android não deixar com await

      await startSoundNotification(remoteMessage?.data);
      if (Platform.OS === 'android') {
        // openNewRaceWindow(remoteMessage?.data);
        OpenApp.invokeApp();
      } else {
        Linking.openURL(`${config.PACKAGE}://app`);
      }
    }
  } catch (err) {}
});

messaging().onMessage(async remoteMessage => {
  try {
    await onMessageReceived(remoteMessage);
  } catch (err) {
    console.log('fail onMessage', err);
  }
});

const onMessageReceived = async remoteMessage => {
  try {
    if (remoteMessage?.data && remoteMessage?.data?.bookingId) {
      if (Platform.OS === 'android') {
        OpenApp.invokeApp();
      } else {
        Linking.openURL(`${config.PACKAGE}://app`);
      }

      await startSoundNotification();
    }

    const data = remoteMessage?.data;

    let title = data?.title || config.nameApp;
    let message = data?.message ? data?.message : data?.body;

    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      sound: 'alert',
      vibration: true,
      lights: true,
      vibrationPattern: [500, 300],
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    });

    await notifee.displayNotification({
      title: title,
      body: message,
      android: {
        channelId,
        visibility: AndroidVisibility.PUBLIC,
        vibrationPattern: [500, 300],
        lights: [AndroidColor.RED, 300, 600],
        sound: 'alert',
        smallIcon: 'ic_launcher',
        // pressAction: {
        //   id: 'default',
        // },
        category: AndroidCategory.CALL,
        importance: AndroidImportance.HIGH,
        fullScreenAction: {
          id: 'default',
          mainComponent: appName,
        },
        asForegroundService: true,
        timeoutAfter: 25000,
      },
      ios: {
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
          list: true,
          interruptionLevel: 'timeSensitive',
        },
      },
    });
  } catch (err) {
    console.log('fail playMessage', err);
  }
};

const Redux = () => (
  <Provider store={store}>
    <SettingsProvider>
      <App />
      <SandBox />
    </SettingsProvider>
  </Provider>
);

async function openNewRaceWindow(remoteMessage) {
  try {
    const isPermission = await drawOverlays().isPermission();
    if (isPermission) {
      DeviceEventEmitter.removeAllListeners('onSessionAcceptRace');
      DeviceEventEmitter.removeAllListeners('onSessionRefused');

      DeviceEventEmitter.addListener('onSessionRefused', onSessionRefused);
      DeviceEventEmitter.addListener(
        'onSessionAcceptRace',
        onSessionAcceptRace,
      );

      const userAuth = await StorageGet(config.tokenAuth);
      bookingId = remoteMessage.bookingId;
      userId = userAuth._id;
      var user_id = '"user_id":"' + userId + '"'.replace("'", '');
      var path =
        '"path":"' +
        `${config.FIREBASE_PATH}booking/driver/${userId}` +
        '"'.replace("'", '');
      let remoteMessageDataToString = JSON.stringify(remoteMessage)
        .replace('{', '')
        .replace('}', '');
      OpenApp.newRaceWindow(
        remoteMessageDataToString + ',' + user_id + ',' + path,
      );
    }
  } catch (err) {}
}

function HeadlessCheck({ isHeadless }) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }
  return <Redux />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
TrackPlayer.registerPlaybackService(() => onRegisterPlayback);
