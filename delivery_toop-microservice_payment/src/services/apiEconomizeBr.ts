import axios from 'axios';

const apiEconomizeBr = axios.create({
  baseURL: process.env.API_ECONOMIZE_BR,
});

export default apiEconomizeBr;
