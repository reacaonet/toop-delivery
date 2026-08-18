const axios = require("axios");

const integrationApi = axios.create({
  baseURL: process.env.INTEGRATION_URL + "/v1",
  // baseURL: 'http://localhost:8400/v1',
  headers: {
    Accept: "application/json",
  },
});

module.exports = integrationApi;
