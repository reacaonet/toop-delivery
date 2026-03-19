import {PermissionsAndroid, Alert, Linking, Platform} from 'react-native';
import {request, check, PERMISSIONS, RESULTS} from 'react-native-permissions';

const runtimePermission = async (alwaysAsk: any): Promise<any> => {
  if (Platform.OS === 'ios') {
    return await runtimePermissionIOS(alwaysAsk);
  } else {
    return await runtimePermissionAndroid(alwaysAsk);
  }
};

const runtimePermissionAndroid = async (alwaysAsk: any): Promise<any> => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'TOOP Delivery',
        message: 'Permita o TOOP Delivery a ter acesso a sua localização ?',
        buttonPositive: 'Permitir',
        buttonNegative: 'Negar',
      },
    );

    const isBackground = await isPermissionAndroidBackgrond();

    if (isBackground !== true) {
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

    if (granted === 'never_ask_again') {
      if (alwaysAsk) {
        Alert.alert(
          'Permissão',
          'É necessário conceder permissão Localização',
          [
            {
              text: 'Proceguir',
              onPress: () => Linking.openSettings(),
            },
          ],
          {cancelable: false},
        );
      }
      return false;
    } else if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('Sem permissão Localização');
      return false;
    } else {
      console.log('Permissão Localização OK!');
      return true;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

const runtimePermissionIOS = async (_alwaysAsk: any): Promise<any> => {
  try {
    await request(PERMISSIONS.IOS.LOCATION_ALWAYS, {
      title: 'TOOP Delivery',
      message: 'Permita o TOOP Delivery a ter acesso a sua localização ?',
      buttonPositive: 'SIM',
      buttonNegative: 'NÃO',
    });

    check(PERMISSIONS.IOS.LOCATION_ALWAYS).then((result) => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          console.log(
            'This feature is not available (on this device / in this context)',
          );
          return false;
        case RESULTS.DENIED:
          console.log(
            'The permission has not been requested / is denied but requestable',
          );
          return false;
        case RESULTS.GRANTED:
          console.log('The permission is granted');
          return true;
        case RESULTS.BLOCKED:
          console.log('The permission is denied and not requestable anymore');
          return false;
      }
    });
  } catch (err) {
    console.log('Fail Check Permission IOS', err);
    return false;
  }
};

const isPermission = async () => {
  if (Platform.OS === 'ios') {
    let resp = await isPermissionIOS();
    return resp;
  }

  let resp = await isPermissionAndroid();
  return resp;
};

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

const isPermissionAndroidBackgrond = () => {
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
};

export default runtimePermission;
export {runtimePermission, isPermission, isPermissionAndroidBackgrond};
