import { put } from 'redux-saga/effects';
import { currentPosition } from '../../services/geolocation/location';

import { GET_LOCATION, CLEAN_LOCATION } from '../storeTypes';
import {
  StorageGet,
  StorageSet,
  StorageClean,
} from '../../services/deviceStorage';

/** Service */
import Permission from '../../services/permissions/permissions';

const key = '@location';
const attempts = 3;
let counter = 0;

export function* getLocation(): any {
  try {
    const location: any = yield StorageGet(key);
    yield put({ type: GET_LOCATION, payload: location || {} });
  } catch (err) {
    console.log('Error getAuth', err);
  }
}

export function* setLocation(): any {
  let isPermission = yield Permission().isPermission();

  if (!isPermission) {
    yield Permission().setPermission();
    isPermission = yield Permission().isPermission();
  }

  if (isPermission) {
    const coord = yield currentPosition();
    console.log('coordinate', coord);

    counter = 0;
    yield StorageSet(key, coord);
    yield getLocation();
  } else if (counter < attempts) {
    counter++;
    yield sleep(2);
    yield setLocation();
  }
}

export function* cleanLocation() {
  yield StorageClean(key);
  yield put({ type: CLEAN_LOCATION });
}

export function* sleep(seconds: number): any {
  yield new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, seconds * 1000);
  });
}
