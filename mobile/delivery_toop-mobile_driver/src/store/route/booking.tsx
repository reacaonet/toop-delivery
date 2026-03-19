import { put } from 'redux-saga/effects';
import { GET_BOOKING, CLEAN_BOOKING } from '../storeTypes';
import {
  StorageGet,
  StorageSet,
  StorageClean,
} from '../../services/deviceStorage';

const key = '@booking';

export function* getBooking() {
  try {
    const booking: any = yield StorageGet(key);
    yield put({ type: GET_BOOKING, payload: booking || {} });
  } catch (err) {
    console.log('Error getAuth', err);
  }
}

export function* setBooking(action: any) {
  if (!action || !action.payload || action.payload == null) {
    return;
  }

  yield StorageSet(key, action.payload);
  yield getBooking();
}

export function* updateBooking(action: any) {
  if (!action || !action.payload || action.payload == null) {
    return;
  }

  let booking: any = yield StorageGet(key);

  if (!booking) {
    yield StorageSet(key, action.payload);
    yield getBooking();
    return;
  }

  booking = { ...booking, ...action.payload };

  yield StorageSet(key, booking);
  yield getBooking();
}

export function* cleanBooking() {
  yield StorageClean(key);
  yield put({ type: CLEAN_BOOKING });
}
