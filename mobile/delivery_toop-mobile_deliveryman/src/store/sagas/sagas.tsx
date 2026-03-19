import {
  GET_USER_SAGA,
  SET_USER_SAGA,
  CLEAN_USER_SAGA,
  SET_UPDATE_ORDER,
  // SET_PIP_ANDROID_UPDATE,
} from './sagasTypes';
import {takeEvery} from 'redux-saga/effects';
import {getAuth, setAuth, cleanAuth, setUpdateOrder} from './user';
// import {setPipAndroid} from './pipAndroid';

export default function* rootSaga() {
  yield takeEvery(GET_USER_SAGA, getAuth);
  yield takeEvery(SET_USER_SAGA, setAuth);
  yield takeEvery(CLEAN_USER_SAGA, cleanAuth);
  yield takeEvery(SET_UPDATE_ORDER, setUpdateOrder);
  // yield takeEvery(SET_PIP_ANDROID_UPDATE, setPipAndroid);
}
