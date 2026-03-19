import {GET_PIP_ANDROID} from '../storeTypes';
import {put} from 'redux-saga/effects';

export function* setPipAndroid(action: any) {
  yield put({type: GET_PIP_ANDROID, payload: action.payload});
}

// export function* getAuth() {
//   try {
//     yield put({type: GET_PIP, payload: userAuth});
//   } catch (err) {
//     console.log('Error getAuth', err);
//   }
// }
