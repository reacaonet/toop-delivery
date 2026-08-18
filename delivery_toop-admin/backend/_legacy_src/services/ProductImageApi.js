const axios = require("axios");

const productImageApi = axios.create({
  baseURL: process.env.PRODUCT_IMAGE_API,
  headers: {
    Accept: "application/json",
  },
});

module.exports = productImageApi;
