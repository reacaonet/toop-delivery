import {GET_USER, UPDATE_ORDER} from '../storeTypes';
import {
  StorageGet,
  StorageSet,
  StorageClean,
} from '../../services/deviceStorage';
import config from '../../config';

import {put} from 'redux-saga/effects';

export function* setUpdateOrder(action: any) {
  try {
    yield StorageSet('updateListOrder', action.payload);
    yield put({type: UPDATE_ORDER, payload: true});
  } catch (err) {
    console.log('Error setUpdateOrder', err);
  }
}

export function* getAuth() {
  try {
    const userAuth = yield StorageGet(config.tokenAuth);
    yield put({type: GET_USER, payload: userAuth});
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

export function* cleanAuth() {
  yield StorageClean(config.tokenAuth);
  yield put({type: GET_USER, payload: {}});
}
