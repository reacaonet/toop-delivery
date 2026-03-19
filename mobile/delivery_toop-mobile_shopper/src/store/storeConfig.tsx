import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import userReducer from './reducers/user';
import orderReducer from './reducers/order';
import rootSaga from './sagas/sagas';

const reducers = combineReducers({
  authUser: userReducer,
  order: orderReducer,
});

const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducers, compose(applyMiddleware(sagaMiddleware)));
sagaMiddleware.run(rootSaga);

export default store;