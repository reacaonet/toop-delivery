const axios = require("axios");

const notificationApi = axios.create({
  baseURL: process.env.NOTIFICATION_URL,
  headers: {
    Accept: "application/json",
    authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJzdWIiOiIxMjM0NTY3ODkw",
  },
});

module.exports = notificationApi;
