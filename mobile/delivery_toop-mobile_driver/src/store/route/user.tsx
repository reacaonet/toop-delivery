import { put } from 'redux-saga/effects';
import { GET_USER } from '../storeTypes';
import {
  StorageGet,
  StorageSet,
  StorageCleanAll,
} from '../../services/deviceStorage';
import config from '../../config';

export function* getAuth(): any {
  try {
    const userAuth: any = yield StorageGet(config.tokenAuth);

    yield put({ type: GET_USER, payload: userAuth });
  } catch (err) {
    console.log('Error getAuth', err);
  }
}

export function* setAuth(action: any) {
  if (!action || !action.payload || action.payload == null) {
    return;
  }

  yield StorageSet(config.tokenAuth, action.payload);
  yield getAuth();
}

export function* clearSession() {
  yield StorageCleanAll();
  yield getAuth();
}
