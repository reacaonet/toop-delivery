import axios from 'axios';
const packageJson = require('../../package.json');
import env from '../config';
import i18next from '../locales';

// import * as RootNavigation from '../navigations/rootNavigation';

/** Service */
import { StorageGet } from './deviceStorage';

axios.defaults.params = {};
export const api = axios.create({
  baseURL: env.apiUrl,
  headers: {
    Accept: 'application/json',
    appversion: packageJson.version,
    applicationId: env?.applicationId,
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  timeout: env.timeout,
});

api.interceptors.request.use(
  async (config: any) => {
    let storage: any = await StorageGet(env.tokenAuth);
    let language: string = await StorageGet('@language');
    storage = storage || {};

    if (!language) {
      language = env.languageDefault;
    }

    config.params.lng = language;
    config.params.retryDelay = 1500;

    if (config?.params?.retry >= 0) {
      config.params.retry = config?.params?.retry;
    } else {
      if (!config?.params) {
        config.params = {};
      }

      config.params.retry = 3;
    }

    config.headers = {
      ...config.headers,
      Authorization:
        storage && storage.jwtToken ? `Bearer ${storage.jwtToken}` : '',
      Accept: 'application/json',
    };

    return config;
  },
  error => {
    Promise.reject(error);
  },
);

api.interceptors.response.use(
  response => {
    return Promise.resolve(response);
  },
  error => {
    const { config, message }: any = error;

    let msgResponse = error?.response?.data?.message || '';
    if (!msgResponse || msgResponse === '') {
      msgResponse = error?.message;
    }

    msgResponse = `${msgResponse}`.trim().toLowerCase();

    // Token Expirou
    if (
      error.config &&
      error.response &&
      error.response.status &&
      error.response.status === 401
    ) {
      const originalRequest = error.config;
      return refreshToken()
        .then(resp => {
          // originalRequest.headers.Authorization = `Bearer ${resp.token}`;
          originalRequest.headers.Authorization = resp;
          return axios(originalRequest);
        })
        .catch(error => {
          console.log('Refresh Token Error, Redirecionar usuário', error);
          // Enviar Usuário para Tela de login
          return axios(originalRequest);
        });
    }

    if (
      config?.params.retry &&
      config?.params.retry > 0 &&
      (error?.response?.status === 502 ||
        error?.response?.status === 503 ||
        msgResponse.includes('network error') ||
        message.includes('network error'))
    ) {
      config.params.retry -= 1;

      const delayRetryRequest = new Promise((resolve: any) => {
        setTimeout(() => {
          console.log('retry the request', config.url);
          return resolve();
        }, config.retryDelay || 1000);
      });

      return delayRetryRequest.then(() => api(config));
    }

    if (
      config?.params.retry &&
      config?.params.retry > 0 &&
      error?.code === 'ECONNABORTED'
    ) {
      config.params.retry -= 1;

      const delayRetryRequest = new Promise((resolve: any) => {
        setTimeout(() => {
          console.log('retry the request', config.url);
          return resolve();
        }, 5000);
      });

      return delayRetryRequest.then(() => api(config));
    }

    console.log('Api axios Promise.reject ...', {
      message: error?.message,
      status: error?.response?.status,
      baseURL: error?.config?.baseURL,
      url: error?.config?.url,
      method: error?.config?.method,
    });
    return Promise.reject(error);
  },
);

const refreshToken = async () => {
  try {
    // console.log('Refresh token ...');
    let storage = await StorageGet(env.tokenAuth);
    storage = storage || {};

    // const { data: resp }: any = await api.post('/auth/refresh', {
    //   refreshToken: storage.refresh,
    // });

    // storage.token = resp.token;
    // storage.refresh = resp.refresh;
    // await StorageSet(config.tokenAuth, storage);
    // return resp;

    const token = storage.jwtToken ? `Bearer ${storage.jwtToken}` : '';
    return token;
  } catch (err) {
    console.log('Falha gerada no refreshToken', err);
    throw err;
  }
};

export const ErrorAxios = (err: any, source: string) => {
  try {
    if (err.response && err.response.data) {
      if (!env.debug) {
        console.log(`${source}`, err.response.data);
      }

      return err.response.data;
    } else {
      if (!env.debug) {
        console.log(`${source}`, err);
      }
      return err;
    }
  } catch (e) {
    return null;
  }
};

export const ErrorMessageServer = (err: any) => {
  try {
    if (err.response && err.response.data && err.response.data.message) {
      return {
        errMessage: err.response.data.message,
      };
    }

    let msgResponse = `${i18next.t('axios.error.message')}`;

    if (!err.response && !err.request) {
      // nenhuma comunicação feita com o servidor
      msgResponse = i18next.t('axios.error.network');
    } else if (err.request) {
      // solicitação enviada para o servidor mas não respondida
      if (
        err.message &&
        `${err.message}`.trim().toLowerCase() === 'network error'
      ) {
        msgResponse = i18next.t('axios.request.networkerror');
        //'o serviço está offline ...';
      }
    }

    return {
      errMessage: msgResponse,
    };
  } catch (e: any) {
    return {
      errMessage: `${i18next.t('axios.error.message')}` + e.message,
    };
  }
};

export default api;
