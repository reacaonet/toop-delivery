import axios from 'axios';

const EconomizeBrasil = axios.create({
  baseURL: process.env.ECBR_URL,
});

export default EconomizeBrasil;