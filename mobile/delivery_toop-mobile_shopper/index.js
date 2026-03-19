import 'react-native-gesture-handler';
import React from 'react';
import {Text, TextInput, Linking, Platform} from 'react-native';
import {Provider} from 'react-redux';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import store from './src/store/storeConfig';
import TrackPlayer from 'react-native-track-player';
import messaging from '@react-native-firebase/messaging';

/** Services */
import openIntent from './src/services/Background/openIntent';
import {startSoundNotification} from './src/services/TrackPlayer/soundNotification';
/** Components */
import SandBox from './src/components/shared/button/sandBox';

/** Disabled font user */
Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = {};
TextInput.defaultProps.allowFontScaling = false;

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  try {
    console.log('setBackgroundMessageHandler', remoteMessage);
    if (remoteMessage?.notification?.body?.includes('novo pedido')) {
      console.log('novo pedido');
      await startSoundNotification();
      if (Platform.OS === 'android') {
        console.log('Chamando o openIntent ...');
        await openIntent().open('toopdelivery-comercio://app');
      } else if (Platform.OS === 'ios') {
        Linking.openURL('toopdelivery-comercio://app');
      }
    }
  } catch (err) {
    console.log('Error setBackgroundMessageHandler', err);
  }
});

// IOS
function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return Redux();
}

const Redux = () => (
  <Provider store={store}>
    <App />
    <SandBox />
  </Provider>
);

AppRegistry.registerComponent(appName, () => HeadlessCheck);

TrackPlayer.registerPlaybackService(() =>
  require('./src/services/TrackPlayer/soundEvents'),
);
