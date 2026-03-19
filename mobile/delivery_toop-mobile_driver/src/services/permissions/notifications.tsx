import {
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';

import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

function NotificationPermission() {
  function isPermission(): Promise<boolean> {
    return new Promise(resolve => {
      try {
        checkNotifications()
          .then(({ status, settings }) => {
            if (status === 'granted' || status === 'limited') {
              return resolve(true);
            }

            return resolve(false);
          })
          .catch(err => {
            console.log('Fail Permissions', err);
            resolve(false);
          });
      } catch (err) {
        console.log('Fail Permissions', err);
        resolve(false);
      }
    });
  }

  async function requestPermissionIOS(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        return true;
      }

      return false;
    } catch (err) {
      return false;
    }
  }

  async function requestPermissionANDROID() {
    try {
      const response = await requestNotifications(['alert', 'sound']);
      if (response?.status === 'granted' || response?.status === 'limited') {
        return true;
      }

      return false;
    } catch (err) {
      return false;
    }
  }

  return {
    isPermission,
    requestPermissionIOS,
    requestPermissionANDROID,
  };
}

export default NotificationPermission;
