const axios = require("axios");

const apiPaymentService = axios.create({
  baseURL: process.env.PAYMENT_URL,
});

module.exports = apiPaymentService;
