import {StorageGet, StorageClean} from '../services/deviceStorage';
import AsyncStorage from '@react-native-community/async-storage';
import config from '../config';

const isAuthenticated = async () => {
  try {
    const userAuth = await StorageGet(config.tokenAuth);
    if (userAuth && userAuth.user && userAuth.user._id && userAuth.user.email) {
      await AsyncStorage.setItem('@key', userAuth.user._id);
      return userAuth.user;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

const cleanUser = async () => {
  await StorageClean(config.tokenAuth);
  return;
};

export default isAuthenticated;
export {cleanUser};
