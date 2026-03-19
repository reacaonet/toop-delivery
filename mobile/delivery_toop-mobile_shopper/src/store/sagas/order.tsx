import {GET_ORDER} from '../storeTypes';
import {eventChannel, END} from 'redux-saga';
import {put, call, take, cancelled} from 'redux-saga/effects';
const ORDER_DELAY = 30000;
const ORDER_LOOP = 1000000;

import {listOrder} from '../../services/provider/shopping/order';

export function* getOrder(action: any) {
  try {
    if (!action || !action.payload || action.payload == null) {
      return;
    }

    let params = {};
    if (action.payload.params) {
      params = action.payload.params;
    }

    // Init Values
    const resp = yield listOrder(action.payload.company, params);
    yield put({type: GET_ORDER, payload: resp});

    const chan = yield call(countdown, ORDER_LOOP);
    try {
      while (true) {
        yield take(chan);
        const respOrder = yield listOrder(action.payload.company, params);
        yield put({type: GET_ORDER, payload: respOrder});
      }
    } finally {
      if (yield cancelled()) {
        chan.close();
        console.log('orderList cancelled');
      }
    }
  } catch (err) {
    console.log('Error getAuth', err);
  }
}

function countdown(secs: number) {
  return eventChannel((emitter) => {
    const iv = setInterval(() => {
      secs -= 1;
      if (secs > 0) {
        emitter(secs);
      } else {
        // this causes the channel to close
        emitter(END);
      }
    }, ORDER_DELAY);
    // The subscriber must return an unsubscribe function
    return () => {
      clearInterval(iv);
    };
  });
}