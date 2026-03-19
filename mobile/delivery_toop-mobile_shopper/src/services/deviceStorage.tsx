import AsyncStorage from '@react-native-community/async-storage';

const StorageClean = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (err) {
    console.log('AsyncStorage Error: ' + err.message);
    return false;
  }
};

const StorageGet = async (key: string) => {
  try {
    let item: any = await AsyncStorage.getItem(key);

    try {
      item = JSON.parse(item);
    } catch (e) {
      return item;
    }
    return item;
  } catch (err) {
    console.log('AsyncStorage Error: ' + err.message);
    return null;
  }
};

const StorageSet = async (key: string, value: any) => {
  try {
    let item = value;
    if (typeof item === 'object') {
      item = JSON.stringify(item);
    }

    await AsyncStorage.setItem(key, item);
  } catch (err) {
    console.log('StorageSet Error: ' + err.message);
  }
};

export {StorageClean, StorageGet, StorageSet};  