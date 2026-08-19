import React, {useEffect} from 'react';
import 'react-native-gesture-handler';
import {StatusBar, Linking, Platform} from 'react-native';
import {Colors} from './styles';
import Navigator from './navigations';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { OTAProvider } from './services/ota/OTAProvider';


import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

/** Service */
import openIntent from './services/Background/openIntent';
import {startSoundNotification} from './services/TrackPlayer/soundNotification';

messaging().onMessage(async (remoteMessage) => {
  try {
    // Aqui pode atualizar a UI
    console.log('onMessage', remoteMessage);
    if (remoteMessage?.notification?.body?.includes('novo pedido')) {
      if (Platform.OS === 'android') {
        await startSoundNotification();
        openIntent().open('toopdelivery-comercio://app');
      } else if (Platform.OS === 'ios') {
        Linking.openURL('toopdelivery-comercio://app');
      }
    }
  } catch (err) {}
});

PushNotification.configure({
  onNotification: function (notification: any) {
    console.log('Notificação Local', notification);
    PushNotification.localNotification({
      ...notification,
      channelId: 'fcm_fallback_notification_channel',
      vibrate: true,
      vibration: 4000,
      priority: 'high',
      soundName: 'sound_notification',
      ignoreInForeground: false,
      color: Colors.PRIMARY,
    });

    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  popInitialNotification: true,
  requestPermissions: true,
});

// PushNotification.getChannels(function (channels) {
//   console.log('getchannels gives us', channels);
// });

export default function App() {
  useEffect(() => {}, []);

  return (
    <OTAProvider app="shopper" currentVersion="2.1.4" serverUrl="http://localhost:8500">
      <>
        <StatusBar
          translucent={true}
          hidden={false}
          barStyle="light-content"
          backgroundColor="transparent"
        />
        <SafeAreaProvider>
        <Navigator />
        </SafeAreaProvider>
      </>
    </OTAProvider>
  );
}
