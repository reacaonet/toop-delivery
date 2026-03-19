import Geolocation from 'react-native-geolocation-service';
// import Geolocation from '@react-native-community/geolocation';
import { Alert } from 'react-native';
import { t } from 'i18next';

let dispatch: any = null;
let userCurrent: any = null;

export const currentPosition = async () => {
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      result => {
        const {
          coords: { latitude, longitude },
        } = result;

        resolve({
          latitude,
          longitude,
        });
      },
      err => {
        console.log('fail currentPosition', err);
        resolve(false);
      },
      {
        timeout: 20000,
        enableHighAccuracy: true,
        maximumAge: 10000,
        // forceLocationManager: true,
      },
    );
  });
};

export const watchLocation = async (dispat: any, user: any) => {
  try {
    dispatch = dispat;
    userCurrent = user;

    Geolocation.watchPosition(sucessWatch, errorWatch, {
      enableHighAccuracy: true,
      distanceFilter: 110,
      interval: 20000,
      forceRequestLocation: true,
    });
  } catch (err) {}
};

const sucessWatch = (position: any) => {
  if (dispatch) {
    dispatch({
      type: 'SET_LOCATION_SAGA',
      payload: {
        location: position.coords,
        user: userCurrent,
      },
    });
  }
};

const errorWatch = (error: any) => {
  let message = '';

  switch (error.code) {
    case 1:
      message = 'A permissão de localização não foi concedida';
      break;
    case 2:
      message = 'A permissão de localização não foi concedida';
      break;
    case 3:
      message = 'A solicitação de localização expirou';
      break;
    case 4:
      message =
        'O serviço Google Play não está instalado ou tem uma versão mais antiga (somente Android)';
      break;
    case 5:
      message =
        'O serviço de localização não está ativado ou o modo de localização não é apropriado para a solicitação atual';
      break;
  }

  if (message) {
    Alert.alert(t('alert.location'), message);
  } else {
    console.log(error.code, error.message);
  }
};
