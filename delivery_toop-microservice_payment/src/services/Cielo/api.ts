import axios from 'axios';

const apiCielo = axios.create({
  baseURL: process.env.API_CIELO_E_COMERCE,
});

const apiQueryCielo = axios.create({
  baseURL: process.env.API_CIELO_E_COMERCE_QUERY,
});

const apiBraspag = axios.create({
  baseURL: process.env.BRASPAG_OAUTH2_SERVER,
});

const apiBraspagSplit = axios.create({
  baseURL: process.env.BRASPAG_SPLIT,
});

const apiBraspagSplitOnboarding = axios.create({
  baseURL: process.env.BRASPAG_SPLIT_ONBOARDING,
});

export {
  apiCielo,
  apiQueryCielo,
  apiBraspag,
  apiBraspagSplit,
  apiBraspagSplitOnboarding,
};
