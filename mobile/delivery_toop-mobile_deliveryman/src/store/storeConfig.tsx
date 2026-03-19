import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import userReducer from './reducers/user';
import orderReducer from './reducers/order';
import PipAndroidReducer from './reducers/PipAndroid';
import rootSaga from './sagas/sagas';

const reducers = combineReducers({
  authUser: userReducer,
  updateOrder: orderReducer,
  androidPip: PipAndroidReducer,
});

const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducers, compose(applyMiddleware(sagaMiddleware)));
sagaMiddleware.run(rootSaga);

export default store;
