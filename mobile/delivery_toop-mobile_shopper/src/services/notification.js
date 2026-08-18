import axios from 'axios';
import Config from '../config';

const notificationApi = axios.create({
  baseURL: Config.urlNotification,
  headers: {
    Accept: 'application/json',
    authorization: Config.NOTIFICATION_API_KEY || '',
  },
});

export default notificationApi;
