import { put } from 'redux-saga/effects';
import { SET_CONFIGURATIONS } from '../storeTypes';

export function* setConfigurations(action: any) {
  yield put({ type: SET_CONFIGURATIONS, payload: action.payload || null });
}
