const axios = require("axios");

const axiosApi = axios.create({
  //baseURL: process.env.API_CIELO_E_COMERCE,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  timeout: 30000,
});

axiosApi.interceptors.response.use(
  response => {
    return Promise.resolve(response);
  },
  error => {
    if (error.request._hasError === true && error.request._response.includes("connect")) {
      noNetwork();
      return Promise.reject(error);
    }

    // Token Expirou
    // if (error.config && error.response && error.response.status === 401) {
    //   const originalRequest = error.config;
    //   console.log('O Token Expirou', originalRequest);
    // }

    return Promise.reject(error);
  },
);

const noNetwork = () => {
  console.log("Não foi possível conectar, sem conexão a internet");
};

module.exports = axiosApi;
