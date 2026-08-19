import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import {
  Alert,
  Platform,
  DevSettings,
  NativeModules,
} from 'react-native';

const OTAContext = createContext({
  isChecking: false,
  lastCheck: null,
  updateAvailable: false,
  latestVersion: null,
});

const OTA_SERVER_DEFAULT = 'http://localhost:8500';
const CHECK_INTERVAL = 30 * 60 * 1000;

let _bundleLoaded = false;

export function OTAProvider({
  children,
  app,
  serverUrl,
  currentVersion,
  autoCheck = true,
  checkOnMount = true,
  onCheckComplete,
  onUpdateReady,
  mandatory = false,
}) {
  const server = serverUrl || OTA_SERVER_DEFAULT;
  const [state, setState] = React.useState({
    isChecking: false,
    lastCheck: null,
    updateAvailable: false,
    latestVersion: null,
    downloadProgress: 0,
  });

  const checkForUpdate = useCallback(async (silent = true) => {
    if (state.isChecking) return;

    setState(prev => ({ ...prev, isChecking: true }));

    try {
      const platform = Platform.OS;
      const url = `${server}/api/v1/updates/check?app=${app}&platform=${platform}&currentVersion=${currentVersion}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.updateAvailable) {
        setState(prev => ({
          ...prev,
          updateAvailable: true,
          latestVersion: data.version,
          isChecking: false,
          lastCheck: new Date(),
        }));

        if (!silent && onUpdateReady) {
          onUpdateReady(data);
        }

        if (!silent || data.mandatory) {
          Alert.alert(
            'Atualizacao disponivel',
            `Versao ${data.version}${data.description ? `\n${data.description}` : ''}`,
            [
              { text: 'Agora', onPress: () => downloadAndApply(data) },
              ...(data.mandatory ? [] : [{ text: 'Depois', style: 'cancel' }]),
            ]
          );
        }
      } else {
        setState(prev => ({
          ...prev,
          isChecking: false,
          lastCheck: new Date(),
          updateAvailable: false,
        }));
      }

      if (onCheckComplete) {
        onCheckComplete(data);
      }
    } catch (err) {
      setState(prev => ({ ...prev, isChecking: false }));
      if (!silent) {
        console.warn('[OTA] Check failed:', err.message);
      }
    }
  }, [app, server, currentVersion, state.isChecking]);

  const downloadAndApply = useCallback(async (updateInfo) => {
    try {
      const downloadUrl = `${server}${updateInfo.downloadUrl}`;
      const response = await fetch(downloadUrl);
      const bundleCode = await response.text();

      if (Platform.OS === 'android') {
        const { OTAStorage } = NativeModules;
        if (OTAStorage && OTAStorage.saveBundle) {
          await OTAStorage.saveBundle(updateInfo.version, bundleCode, updateInfo.bundleHash);
          Alert.alert(
            'Atualizacao pronta',
            'Reinicie o app para aplicar a atualizacao.',
            [{ text: 'Reiniciar', onPress: () => DevSettings.reload() }]
          );
        } else {
          console.warn('[OTA] OTAStorage native module not found');
        }
      } else if (Platform.OS === 'ios') {
        const { OTAStorage } = NativeModules;
        if (OTAStorage && OTAStorage.saveBundle) {
          await OTAStorage.saveBundle(updateInfo.version, bundleCode, updateInfo.bundleHash);
          Alert.alert(
            'Atualizacao pronta',
            'Reinicie o app para aplicar a atualizacao.',
            [{ text: 'Reiniciar', onPress: () => DevSettings.reload() }]
          );
        }
      }
    } catch (err) {
      console.error('[OTA] Download failed:', err);
      Alert.alert('Erro', 'Falha ao baixar atualizacao. Tente novamente.');
    }
  }, [server]);

  const loadSavedBundle = useCallback(async () => {
    try {
      const { OTAStorage } = NativeModules;
      if (OTAStorage && OTAStorage.loadBundle) {
        const bundle = await OTAStorage.loadBundle();
        if (bundle && !_bundleLoaded) {
          _bundleLoaded = true;
          eval(bundle);
        }
      }
    } catch (err) {
      console.warn('[OTA] Could not load saved bundle:', err.message);
    }
  }, []);

  useEffect(() => {
    if (checkOnMount) {
      checkForUpdate(true);
    }

    if (autoCheck) {
      const interval = setInterval(() => {
        checkForUpdate(true);
      }, CHECK_INTERVAL);

      return () => clearInterval(interval);
    }
  }, []);

  const value = {
    ...state,
    checkForUpdate: () => checkForUpdate(false),
    downloadAndApply,
  };

  return (
    <OTAContext.Provider value={value}>
      {children}
    </OTAContext.Provider>
  );
}

export function useOTA() {
  return useContext(OTAContext);
}

export default OTAProvider;
