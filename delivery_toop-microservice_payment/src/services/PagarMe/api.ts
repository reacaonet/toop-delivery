/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios';

const apiPagarMe = axios.create({
  baseURL: process.env.PAGARME_API,
  params: {
    api_key: process.env.PAGARME_API_KEY,
  },
});

export {apiPagarMe};
