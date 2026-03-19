import Geolocation from 'react-native-geolocation-service';
import { Alert } from 'react-native';

let dispatch: any = null;
let userCurrent: any = null;

export const watchLocation = (dispat: any, user: any, time = 20000) => {
  try {
    dispatch = dispat;
    userCurrent = user;

    return Geolocation.watchPosition(sucessWatch, errorWatch, {
      enableHighAccuracy: true,
      distanceFilter: 20,
      interval: time,
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
    Alert.alert('Localização', message);
  } else {
    console.log(error.code, error.message);
  }
};

export const getLocation = (dispat: any, user: any, attemps = 0) => {
  dispatch = dispat;
  userCurrent = user;

  Geolocation.getCurrentPosition(sucessWatch, () => {
    if (attemps < 3) {
      console.log('Nova tentativa recuperar localização', attemps);
      getLocation(dispat, user, attemps++);
    }
  });
};

export const clearWatch = (id: any) => {
  Geolocation.clearWatch(id);
};
