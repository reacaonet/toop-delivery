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
      if (
        granted === Permissions.RESULTS.GRANTED ||
        granted === Permissions.RESULTS.LIMITED
      ) {
        return true;
      }

      return false;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    const granted = await Permissions.request(
      Permissions.PERMISSIONS.IOS.CAMERA,
      {
        title: 'Permissão de câmera',
        message: 'O aplicativo precisa de permissão de câmera',
        buttonPositive: 'Permitir',
        buttonNegative: 'Negar',
      },
    );

    if (
      granted === Permissions.RESULTS.GRANTED ||
      granted === Permissions.RESULTS.LIMITED
    ) {
      return true;
    }

    return false;
  }
};

export const requestExternalWritePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      // WRITE_EXTERNAL_STORAGE -> permission removed Android 13
      if (Platform.Version >= 33) {
        return true;
      }

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
      if (
        granted === Permissions.RESULTS.GRANTED ||
        granted === Permissions.RESULTS.LIMITED
      ) {
        return true;
      }

      return false;
    } catch (err) {
      console.warn('Write permission err => ', err);
      //Alert.alert('Write permission err', err);
    }
    return false;
  } else {
    return true;
  }
};

export const requestReadPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      let granted = '';

      if (Platform.Version >= 33) {
        granted = await Permissions.request(
          Permissions.PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
          {
            title: 'Permissão de leitura galeria imagens',
            message: 'O aplicativo precisa de permissão para ler o arquivo',
            buttonPositive: 'Permitir',
            buttonNegative: 'Negar',
          },
        );
      } else {
        granted = await Permissions.request(
          Permissions.PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          {
            title: 'Permissão de leitura armazenamento externo',
            message: 'O aplicativo precisa de permissão para ler o arquivo',
            buttonPositive: 'Permitir',
            buttonNegative: 'Negar',
          },
        );
      }

      if (
        granted === Permissions.RESULTS.GRANTED ||
        granted === Permissions.RESULTS.LIMITED
      ) {
        return true;
      }

      return false;
    } catch (err) {
      console.warn('Write permission err => ', err);
      //Alert.alert('Write permission err', err);
    }
    return false;
  } else {
    const granted = await Permissions.request(
      Permissions.PERMISSIONS.IOS.PHOTO_LIBRARY,
      {
        title: 'Permissão de leitura armazenamento externo',
        message: 'O aplicativo precisa de permissão para ler o arquivo',
        buttonPositive: 'Permitir',
        buttonNegative: 'Negar',
      },
    );

    if (
      granted === Permissions.RESULTS.GRANTED ||
      granted === Permissions.RESULTS.LIMITED
    ) {
      return true;
    }

    return false;
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
      if (
        granted === Permissions.RESULTS.GRANTED ||
        granted === Permissions.RESULTS.LIMITED
      ) {
        return true;
      }

      return false;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true;
  }
};
