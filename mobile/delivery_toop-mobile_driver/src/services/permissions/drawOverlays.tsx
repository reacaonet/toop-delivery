import { NativeModules } from 'react-native';
const { OverlayPermissionModule } = NativeModules;
function drawOverlays() {
  async function isPermission() {
    try {
      return await OverlayPermissionModule.isPermission();
    } catch (err) {
      console.log('falhou isPermission', err);
      return false;
    }
  }

  function sendSettings() {
    try {
      return OverlayPermissionModule.sendSettings();
    } catch (err) {
      console.log('falhou sendSettings', err);
      return false;
    }
  }

  return {
    isPermission,
    sendSettings,
  };
}

export default drawOverlays;
