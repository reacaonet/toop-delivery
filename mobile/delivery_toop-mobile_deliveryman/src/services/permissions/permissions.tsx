import {Platform, PermissionsAndroid} from 'react-native';
import {request, check, PERMISSIONS, RESULTS} from 'react-native-permissions';

function LocationPermission() {
  async function isPermission() {
    if (Platform.OS === 'ios') {
      const resp = await isPermissionIOS();
      return resp;
    }

    const resp = await isPermissionAndroid();
    const respBackgrond = await isPermissionAndroidBackgrond();

    if (!resp || !respBackgrond) {
      return false;
    }

    return true;
  }

  function isPermissionAndroid() {
    return new Promise((resolve, _reject) => {
      try {
        check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
          .then((result) => {
            if (result === RESULTS.GRANTED) {
              resolve(true);
            }
            resolve(false);
          })
          .catch((_error) => {
            resolve(false);
          });
      } catch (err) {
        resolve(false);
      }
    });
  }

  function isPermissionAndroidBackgrond() {
    return new Promise((resolve, _reject) => {
      try {
        if (Platform.Version < 29) {
          return resolve(true);
        }

        check(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION)
          .then((result) => {
            if (result === RESULTS.GRANTED) {
              resolve(true);
            }
            resolve(false);
          })
          .catch((_error) => {
            resolve(false);
          });
      } catch (err) {
        resolve(false);
      }
    });
  }

  function isPermissionIOS() {
    return new Promise((resolve, _reject) => {
      try {
        check(PERMISSIONS.IOS.LOCATION_ALWAYS)
          .then((result) => {
            if (result === RESULTS.GRANTED) {
              resolve(true);
            }
            resolve(false);
          })
          .catch((_error) => {
            resolve(false);
          });
      } catch (err) {
        resolve(false);
      }
    });
  }

  async function setPermission() {
    if (Platform.OS === 'ios') {
      await setPermissionIOS();
    } else {
      await setPermissionANDROID();
    }

    return await isPermission();
  }

  async function setPermissionIOS() {
    try {
      await request(PERMISSIONS.IOS.LOCATION_ALWAYS, {
        title: 'TOOP Delivery',
        message: 'Permita o TOOP Delivery a ter acesso a sua localização ?',
        buttonPositive: 'Permitir',
        buttonNegative: 'Negar',
      });
    } catch (err) {
      console.log('setPermissionIOS', err);
      return false;
    }
  }

  async function setPermissionANDROID() {
    try {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'TOOP Delivery',
          message: 'Permita o TOOP Delivery a ter acesso a sua localização ?',
          buttonPositive: 'Permitir',
          buttonNegative: 'Negar',
        },
      );

      if (Platform.Version >= 29) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'TOOP Delivery',
            message:
              'Permita que o TOOP Delivery tenha acesso a sua localização em segundo plano?',
            buttonPositive: 'Permitir',
            buttonNegative: 'Negar',
          },
        );
      }
    } catch (err) {
      console.log('setPermissionANDROID', err);
      return false;
    }
  }

  return {
    isPermission,
    setPermission,
  };
}

export default LocationPermission;
