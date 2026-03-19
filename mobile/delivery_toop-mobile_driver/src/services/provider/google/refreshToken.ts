import messaging from '@react-native-firebase/messaging';

/** Service */
import { updateDriver } from '../user/update';

export const UserRefreshToken = async (userAuth: any) => {
  try {
    if (userAuth && userAuth?._id) {
      await messaging()
        .registerDeviceForRemoteMessages()
        .catch(err => {
          console.log('fail registerDeviceForRemoteMessages', err);
        });

      messaging()
        .getToken()
        .then(async token => {
          updateDriver(userAuth._id, {
            token: token,
          });
        });

      return messaging().onTokenRefresh(token => {
        updateDriver(userAuth._id, {
          token: token,
        });
      });
    }
  } catch (err) {
    console.log('Fail Refresh Token User', err);
  }
};
