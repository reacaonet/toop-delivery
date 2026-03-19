import runtimePermission from '../../services/permissions/locationPermission';
import Geolocation from 'react-native-geolocation-service';
import {updateDeliveryMan, listOne} from '../../services/provider/deliveryMan';
var idMonitorLocation: any = null;

export function watchPosition(user: any) {
  try {
    runtimePermission(false)
      .then((result) => {
        if (result === true) {
          idMonitorLocation = Geolocation.watchPosition(
            (position: any) => locationSuccess(position, user),
            locationError,
            {
              interval: 20000,
              fastestInterval: 20000,
              distanceFilter: 50,
              enableHighAccuracy: true, // GPS
              forceRequestLocation: true,
              useSignificantChanges: true,
            },
          );
          // console.log('Id Monitor', idMonitorLocation);
        }
      })
      .catch((err) => {
        console.log('Location Redux - Sem Permissão de Localização ...', err);
      });
  } catch (err) {
    console.log('Error watchPosition', err);
  }
}

const locationSuccess = (position: any, user: any) => {
  try {
    // console.log('Hey Location Watch', position);
    if (position && position.coords) {
      updateDelivery(position.coords, user);
    }
  } catch (err) {
    console.log('Fail', err);
  }
};

const locationError = (err: any) => {
  console.log('Fail locationError', err);
};

const updateDelivery = async (coord: any, userAuth: any) => {
  try {
    console.log('updateDelivery watchPosition ...');
    await updateDeliveryMan(userAuth.deliveryMan._id, {
      latitude: coord.latitude,
      longitude: coord.longitude,
      status: true,
    });
  } catch (err) {}
};

export const cleanMonitorLocation = () => {
  if (idMonitorLocation !== null) {
    Geolocation.clearWatch(idMonitorLocation);
    idMonitorLocation = null;
  }
};

export const locationCurrent = async () => {
  return new Promise((resolve, reject) => {
    try {
      Geolocation.getCurrentPosition(
        (position: any) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error: any) => {
          reject(error);
        },
      );
    } catch (err) {
      reject(err);
    }
  });
};

export const locationDelivery = async (userAuth: any) => {
  try {
    let respLocation: any = null;

    try {
      respLocation = await locationCurrent();
    } catch (err) {}

    if (respLocation && respLocation.latitude && respLocation.longitude) {
      return respLocation;
    }

    let deliveryMan = await listOne(userAuth.deliveryMan._id);
    if (
      deliveryMan &&
      deliveryMan.location &&
      deliveryMan.location.coordinates
    ) {
      return {
        latitude: deliveryMan.location.coordinates[1],
        longitude: deliveryMan.location.coordinates[0],
      };
    }

    return false;
  } catch (err) {
    console.log('Fail ?', err);
    return false;
  }
};
