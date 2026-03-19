import {Platform} from 'react-native';
import Permissions from 'react-native-permissions';

export const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await Permissions.request(
        Permissions.PERMISSIONS.ANDROID.CAMERA,
        {
          title: 'Permissão de câmera',
          message: 'O aplicativo precisa de permissão de câmera',
          buttonPositive: 'Permitir',
          buttonNegative: 'Negar',
        },
      );
      // If CAMERA Permission is granted
      return granted === Permissions.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true;
  }
};

export const requestExternalWritePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await Permissions.request(
        Permissions.PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Permissão de gravação de armazenamento externo',
          message: 'O aplicativo precisa de permissão de gravação',
          buttonPositive: 'Permitir',
          buttonNegative: 'Negar',
        },
      );
      // If WRITE_EXTERNAL_STORAGE Permission is granted
      return granted === Permissions.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Write permission err => ', err);
      //Alert.alert('Write permission err', err);
    }
    return false;
  } else {
    return true;
  }
};

export const requestGpsPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await Permissions.request(
        Permissions.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        {
          title: 'Permissão de GPS',
          message: 'O aplicativo precisa de permissão de GPS',
          buttonPositive: 'Permitir',
          buttonNegative: 'Negar',
        },
      );
      // If CAMERA Permission is granted
      return granted === Permissions.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true;
  }
};
