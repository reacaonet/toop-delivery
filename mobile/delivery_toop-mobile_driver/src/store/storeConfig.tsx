import {
  legacy_createStore as createStore,
  combineReducers,
  compose,
  applyMiddleware,
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './route';

/** Redux */
import userReducer from './reducers/user';
import bookingReducer from './reducers/booking';
import driverLocationReducer from './reducers/driverLocation';
import preRegistrationReducer from './reducers/preRegistration';
import locationReducer from './reducers/location';
import messageReducer from './reducers/messages';
import configurationsReducer from './reducers/configurations';

const reducers = combineReducers({
  authUser: userReducer,
  booking: bookingReducer,
  driverLocation: driverLocationReducer,
  preRegistration: preRegistrationReducer,
  appMessage: messageReducer,
  configurations: configurationsReducer,
  coordinates: locationReducer,
});

const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducers, compose(applyMiddleware(sagaMiddleware)));
sagaMiddleware.run(rootSaga);

export default store;
