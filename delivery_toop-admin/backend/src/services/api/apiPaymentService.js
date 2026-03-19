import axios from 'axios';
import { updateToken, getTokenMoloni } from '../paymentApi';

axios.defaults.params = {};

const apiPaymentService = axios.create({
  baseURL: process.env.API_PAYMENT_SERVICE,
  headers: {
    Accept: 'application/json',
  },
});

apiPaymentService.interceptors.request.use(async (request) => {
  // antes de enviar a solicitação
  if (request.url && `${request.url}`.search('moloni') >= 0) {
    const token = await getTokenMoloni();

    if (token && token?.access_token) {
      if (request?.params?.auth) {
        delete request.params.auth;
      }

      request.params.auth = token?.access_token;
    }
  }

  return Promise.resolve(request);
});

apiPaymentService.interceptors.response.use(
  async (response) => {
    return Promise.resolve(response);
  },
  (error) => {
    if (
      error.response &&
      error.response?.status &&
      (error.response?.status === 400 || error.response?.status === 401) &&
      error?.config?.url &&
      error?.config?.url.search('moloni') >= 0
    ) {
      const originalRequest = error.config;

      return updateToken()
        .then((resp) => {
          if (resp && resp?.access_token) {
            if (originalRequest?.params?.auth) {
              delete originalRequest.params?.auth;
            }

            originalRequest.params.auth = resp?.access_token;
          }

          return axios(originalRequest);
        })
        .catch(() => {
          return axios(originalRequest);
        });
    }

    return Promise.reject(error);
  },
);

export default apiPaymentService;
