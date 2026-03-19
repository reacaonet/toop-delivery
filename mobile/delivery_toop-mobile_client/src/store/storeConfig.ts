import {
  legacy_createStore as createStore,
  combineReducers,
  compose,
  applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';
import userReducer from './reducers/user';
import locationReducer from './reducers/location';
import cartReducer from './reducers/cart';
import serviceCharge from './reducers/serviceCharge';
import tab from './reducers/tabCategory';
import Booking from './reducers/booking';
import configurationsReducer from './reducers/configurations';

const reducers = combineReducers({
  user: userReducer,
  location: locationReducer,
  cart: cartReducer,
  serviceCharge: serviceCharge,
  tab: tab,
  booking: Booking,
  configurations: configurationsReducer,
});

const storeConfig = () => {
  return createStore(reducers, compose(applyMiddleware(thunk)));
};

export default storeConfig;
