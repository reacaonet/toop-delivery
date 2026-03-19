import { put, call } from 'redux-saga/effects';
import { SET_MESSAGE } from '../storeTypes';

export function* setMessage(action: any) {
  yield put({ type: SET_MESSAGE, payload: action.payload || null });
  yield call(delay, 10000);
  yield put({ type: SET_MESSAGE, payload: null });
}

const delay = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time));
