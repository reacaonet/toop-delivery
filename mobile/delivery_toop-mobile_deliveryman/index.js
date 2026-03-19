import 'react-native-gesture-handler';
import React from 'react';
import messaging from '@react-native-firebase/messaging';
import {Provider} from 'react-redux';
import {AppRegistry, Linking} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import store from './src/store/storeConfig';

/** Service */
import {startSoundNotification} from './src/services/TrackPlayer/soundNotification';

/** Component */
import SandBox from './src/components/shared/button/sandBox';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  notifyNewRace(remoteMessage, 'setBackgroundMessageHandler');
});

messaging().onMessage(async (remoteMessage) => {
  notifyNewRace(remoteMessage, 'onMessage');
});

const notifyNewRace = async (remoteMessage, origin) => {
  try {
    console.log('origin', origin);
    if (remoteMessage.data?.isNewOrder) {
      startSoundNotification();
    }

    // if (remoteMessage.data?.raceValue) {
    //   await StorageSet('@raceValue', remoteMessage.data.raceValue);
    // }

    // if (remoteMessage.data?.orderId) {
    //   await StorageSet('@orderId', remoteMessage.data.orderId);
    // }

    Linking.openURL('toopdelivery-entregador://app');
  } catch (err) {
    console.log(`Error ${origin}`, err);
  }
};

const Redux = () => (
  <Provider store={store}>
    <App />
    <SandBox />
  </Provider>
);

AppRegistry.registerComponent(appName, () => Redux);
