import axios from 'axios';
import Config from '../config';

const notificationApi = axios.create({
  baseURL: Config.urlNotification,
  headers: {
    Accept: 'application/json',
    authorization:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJzdWIiOiIxMjM0NTY3ODkw',
  },
});

export default notificationApi;
