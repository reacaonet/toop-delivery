import {GET_LOCATION, LOCATION} from './actionTypes';
import Geolocation from 'react-native-geolocation-service';
import {runtimePermission} from '../../utils/locationPermission';
var dispatchLocation: any = null;
var idMonitorLocation: any = null;

export const monitorLocation = () => {
  return dispatch => {
    try {
      dispatchLocation = dispatch;
      runtimePermission(false)
        .then(result => {
          //console.log('Permition OK Redux watchPosition');
          if (result === true && idMonitorLocation != null) {
            idMonitorLocation = Geolocation.watchPosition(
              locationSuccess,
              locationError,
              {
                enableHighAccuracy: true, // GPS
                timeout: 15000,
                distanceFilter: 5,
                maximumAge: 10000,
              },
            );

            console.log('Id Monitor', idMonitorLocation);
          }
        })
        .catch(err => {
          console.log('Location Redux - Sem Permissão de Localização ...', err);
        });
    } catch (err) {
      console.log('Faill watchPosition redux', err);
    }
  };
};

export const cleanMonitorLocation = () => {
  return (dispatch: any) => {
    try {
      if (idMonitorLocation !== null) {
        Geolocation.clearWatch(idMonitorLocation);
        idMonitorLocation = null;
      }
    } catch (err) {
      console.log('Fail cleanMonitorLocation');
    }
  };
};

export const getCurrentPosition = () => {
  return (dispatch: any) => {
    try {
      dispatchLocation = dispatch;
      runtimePermission(false)
        .then(result => {
          Geolocation.getCurrentPosition(locationSuccess, locationError, {
            enableHighAccuracy: true,
            maximumAge: 3000,
            accuracy: {
              android: 'high',
              ios: 'nearestTenMeters',
            },
            timeout: 20000,
          });
        })
        .catch(err => {
          console.log(
            'Get Current Location Redux - Sem Permissão de Localização ...',
            err,
          );
        });
    } catch (err) {
      console.log('Faill getCurrentPosition redux', err);
    }
  };
};

export const setCoordinates = (coords: any) => {
  return (dispatch: any) => {
    dispatch(getLocation(coords));
    dispatch(locationCoords());
  };
};

export const getLocation = (coords: any) => {
  return {
    type: GET_LOCATION,
    payload: coords,
  };
};

export const locationCoords = () => {
  return {
    type: LOCATION,
  };
};

const locationSuccess = (position: any) => {
  if (dispatchLocation) {
    dispatchLocation(setCoordinates(position.coords));
  }
};

const locationError = (error: any) => {
  console.log('locationError Redux', error);
};
