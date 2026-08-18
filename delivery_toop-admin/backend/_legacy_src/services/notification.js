const axios = require("axios");

const notificationApi = axios.create({
  baseURL: process.env.NOTIFICATION_URL,
  headers: {
    Accept: "application/json",
    authorization: process.env.NOTIFICATION_API_KEY || "",
  },
});

module.exports = notificationApi;
