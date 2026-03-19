import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import { StorageSet } from '../services/deviceStorage';

import ptbr from './ptbr.json';
import pt from './pt.json';
import ao from './ao.json';

export const resources = {
  'pt-AO': {
    translation: ao,
  },
  'pt-BR': {
    translation: ptbr,
  },
  'pt-PT': {
    translation: pt,
  },
};

const languageDetector: any = {
  type: 'languageDetector',
  async: true,
  detect: (callback: Function) => {
    return callback(RNLocalize.getLocales()[0].languageCode);
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

export const startTranslate = () => {
  i18next
    .use(languageDetector)
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3',
      resources,
      fallbackLng: 'pt-BR',
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      react: {
        useSuspense: false,
      },
    });
};

export const modifyTranslate = (language: string) => {
  try {
    if (language && `${language}` in resources) {
      StorageSet('@language', `${language}`);
      i18next.changeLanguage(language);
    }
  } catch (err) {
    console.log('falhou ao mudar linguagem', err);
  }
};

export default i18next;
