import {
  GET_USER_SAGA,
  SET_USER_SAGA,
  CLEAN_USER_SAGA,
  SET_ORDER_SAGA,
} from './sagasTypes';
import {takeEvery} from 'redux-saga/effects';
import {getAuth, setAuth, cleanAuth} from './user';
import {getOrder} from './order';

export default function* rootSaga() {
  yield takeEvery(GET_USER_SAGA, getAuth);
  yield takeEvery(SET_USER_SAGA, setAuth);
  yield takeEvery(CLEAN_USER_SAGA, cleanAuth);

  /** ORDER */
  yield takeEvery(SET_ORDER_SAGA, getOrder);
}
  