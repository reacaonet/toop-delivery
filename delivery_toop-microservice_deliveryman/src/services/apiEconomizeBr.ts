/* eslint-disable quote-props */
import axios from 'axios';

const apiEconomizeBr = axios.create({
  baseURL: process.env.API_ECONOMIZE_BR,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  timeout: 30000,
});

export default apiEconomizeBr;
