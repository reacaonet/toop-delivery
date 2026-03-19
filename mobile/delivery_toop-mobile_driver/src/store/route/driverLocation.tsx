import { put, call } from 'redux-saga/effects';
import { GET_LOCATION, SET_LOCATION } from '../storeTypes';
import { StorageGet, StorageSet } from '../../services/deviceStorage';
import api from '../../services/api';
import { updateDriver } from '../../services/provider/user/update';

const key = '@driverLocation';

export function* getDriverLocation() {
  try {
    const userLocation: any = yield StorageGet(key);
    yield put({ type: GET_LOCATION, payload: userLocation || {} });

    if (userLocation && userLocation?.user && userLocation?.user?._id) {
      yield call(api.put, `/v1/mobility/driver/${userLocation?.user?._id}`, {
        latitude: userLocation.location.latitude,
        longitude: userLocation.location.longitude,
      });
    }
  } catch (err: any) {
    console.log('Error getDriverLocation', err);
    console.log('err', err?.response?.data);
  }
}

export function* setDriverLocation(action: any) {
  if (!action || !action.payload || action.payload == null) {
    return;
  }

  yield StorageSet(key, action.payload);
  yield getDriverLocation();
}
