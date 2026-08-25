import React from 'react';
import {Provider} from 'react-redux';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

import SandBox from './src/components/shared/btn/sandBox';

import storeConfig from './src/store/storeConfig';

import {StorageGet, StorageSet} from './src/services/deviceStorage';
const store = storeConfig();

messaging().setBackgroundMessageHandler(async remoteMessage => {});

messaging().onMessage(async remoteMessage => {
  try {
    if (remoteMessage.notification && remoteMessage.notification.body) {
      let title = remoteMessage.notification?.title || 'GojáDelivery';
    }
  } catch (err) {
    console.log('Error receive message', err);
  }
});

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // O aplicativo foi lançado em segundo plano pelo iOS
    return null;
  }

  return <Redux />;
}

async function CountOpenApp() {
  const quantity = await StorageGet('OPENAPP');

  if (!quantity) {
    await StorageSet('OPENAPP', '1');
  } else {
    let quantityOpen = parseInt(quantity, 0) + 1;
    await StorageSet('OPENAPP', quantityOpen.toString());
  }
}

function Redux() {
  CountOpenApp();
  return (
    <Provider store={store}>
      <App />
      <SandBox />
    </Provider>
  );
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
