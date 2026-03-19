import axios from 'axios';
const packageJson = require('../../package.json');
import {config} from '../config';

/** Service */
import {StorageGet} from './deviceStorage';

axios.defaults.params = {};

export const api = axios.create({
  baseURL: `${config.apiUrl}`,
  headers: {
    Accept: 'application/json',
    appversion: packageJson.version,
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  timeout: config.timeout,
});

api.interceptors.request.use(
  async (request: any) => {
    let storage: any = await StorageGet(config.tokenAuth);
    storage = storage || {};

    request.params.retryDelay = 1500;

    if (request?.params?.retry >= 0) {
      request.params.retry = request?.params?.retry;
    } else {
      request.params.retry = 3;
    }

    if (storage && storage.jwtToken) {
      request.headers = {
        ...request.headers,
        Authorization:
          storage && storage.jwtToken ? `Bearer ${storage.jwtToken}` : '',
        Accept: 'application/json',
      };
    }

    return Promise.resolve(request);
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  async (response: any) => {
    let storage: any = await StorageGet(config.tokenAuth);
    storage = storage || {};

    response.headers = {
      ...response.headers,
      Authorization:
        storage && storage.jwtToken ? `Bearer ${storage.jwtToken}` : '',
      Accept: 'application/json',
    };

    // return response;
    return Promise.resolve(response);
  },
  (error: any) => {
    const {config, message}: any = error;

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
    // console.log('Refresh token chamado ...');
    let storage = await StorageGet(config.tokenAuth);
    storage = storage || {};

    // const { data: resp } = await api.post('/auth/refresh', {
    //   refreshToken: storage.refresh,
    // });

    // storage.token = resp.token;
    // storage.refresh = resp.refresh;
    // await StorageSet(config.tokenAuth, storage);
    // return resp;

    const token = storage.jwtToken ? `Bearer ${storage?.jwtToken}` : '';
    return token;
  } catch (err) {
    console.log('Falha gerada no refreshToken', err);
    throw err;
  }
};

export const ErrorAxios = (err: any, source: string) => {
  try {
    if (err.response && err.response.data) {
      if (!config.debug) {
        console.log(`${source}`, err.response.data);
      }

      return err.response.data;
    } else {
      if (!config.debug) {
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
    // console.log('ERR DETAIL', err.toJSON());
    // console.log('err.response.data', err.response.data);

    if (err.response) {
      if (err.response && err.response.data && err.response.data.message) {
        return {
          errMessage: err.response.data.message,
        };
      }
    } else if (err.request) {
      return {
        errMessage: 'Verifique sua conexão com a internet',
      };
    } else {
      console.log('Error', err.message);
    }

    return {
      errMessage: 'Não foi possível processar informação',
    };
  } catch (e) {
    return {
      errMessage: 'Não foi possível processar informação',
    };
  }
};

export default api;
