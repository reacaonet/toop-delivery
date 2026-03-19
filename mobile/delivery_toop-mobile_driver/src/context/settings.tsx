import React from 'react';

/** Service */
import api from '../services/api';
import {
  StorageGet,
  StorageClean,
  StorageSet,
} from './../services/deviceStorage';

export const SettingsContext = React.createContext({});

export interface iSettings {
  _id: string;
  name: string;
  packageName: string;
  template: string;
}

export const SettingsProvider = (props: any) => {
  const [settings, setSettings] = React.useState<iSettings>();

  const loadSetting = async () => {
    const data: iSettings = await StorageGet('@current_settings');
    if (data) {
      setSettings(data);
    }

    // api
    //   .get('/v1/admin/applications')
    //   .then(response => {
    //     setSettings(response.data);
    //     StorageSet('@current_settings', response.data);
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     StorageClean('@current_settings');
    //   });
  };

  React.useEffect(() => {
    loadSetting();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        loadSetting,
      }}>
      {props.children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => React.useContext(SettingsContext);
