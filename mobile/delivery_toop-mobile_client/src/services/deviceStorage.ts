import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageMultClean = async (keys: Array<string>) => {
  try {
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (err) {
    return false;
  }
};

export const StorageClean = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (err: any) {
    console.log('AsyncStorage Error: ' + err.message);
    return false;
  }
};

export const StorageMultGet = async (keys: string[]) => {
  try {
    let itens = await AsyncStorage.multiGet(keys);
    let response: any = {};

    for (let i = 0; i < keys.length; i += 1) {
      if (itens[i] && itens[i][0] === keys[i]) {
        response[keys[i]] = itens[i][1];
      } else {
        response[keys[i]] = '';
      }
    }

    return response;
  } catch (err) {
    return null;
  }
};

export const StorageGet = async (key: string): Promise<any> => {
  try {
    let item: any = await AsyncStorage.getItem(key);

    if (item !== null) {
      try {
        return JSON.parse(`${item}`);
      } catch (err) {
        return item;
      }
    }

    return null;
  } catch (err: any) {
    console.log(`AsyncStorage Key Error ${key} : ` + err.message);
    return null;
  }
};

export const StorageSet = async (key: string, value: any) => {
  try {
    if (value) {
      let item = value;
      if (typeof item === 'object') {
        item = JSON.stringify(item);
      }

      await AsyncStorage.setItem(key, item);
    }
  } catch (err: any) {
    console.log('StorageSet Error: ' + err.message);
  }
};

export const StorageCleanAll = async () => {
  let keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys);
  return;
};
