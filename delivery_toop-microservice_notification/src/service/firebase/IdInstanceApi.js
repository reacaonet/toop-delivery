import axios from 'axios';

const idInstanceApi = axios.create({
  baseURL: 'https://iid.googleapis.com/iid',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `key=${process.env.CLOUD_MESSAGING_TOKEN}`
  }
});

export default idInstanceApi;