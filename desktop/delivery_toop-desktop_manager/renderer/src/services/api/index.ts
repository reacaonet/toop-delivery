import axios, { AxiosInstance } from 'axios';
import Store from 'electron-store';

import env from '../../environment';

export function setupApiClient(): AxiosInstance {
  const store = new Store();
  const api = axios.create({
    baseURL: env.apiUrl,
    headers: {
      Authorization: `Bearer ${store.get('accessToken')}`,
      Company: `${store.get('toop.user.company')}`,
    },
  });

  return api;
}
