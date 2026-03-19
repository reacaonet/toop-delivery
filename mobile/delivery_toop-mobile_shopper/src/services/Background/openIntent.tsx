import {NativeModules} from 'react-native';
const {OpenAppModule} = NativeModules;

function openIntent() {
  async function open(intentName: string) {
    try {
      await OpenAppModule.openApp(intentName);
    } catch (err) {
      console.log('falhou start', err);
      return false;
    }
  }

  return {
    open,
  };
}

export default openIntent;
