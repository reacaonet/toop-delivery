const axios = require("axios");
const generateToken = require("./Token");
const Log = require("../../../models/LogModel");

const create = async data => {
  try {
    const token = await generateToken();
    const baseUrl = axios.create({
      baseURL: process.env.BRASPAG_SPLIT_ONBOARDING,
    });
    const response = await baseUrl.post("/api/subordinates/", data, {
      headers: { authorization: `Bearer ${token.access_token}` },
    });
    return response;
  } catch (err) {
    return false;
  }
};

const verify = async cieloMerchantId => {
  try {
    const token = await generateToken();
    const baseUrl = axios.create({
      baseURL: process.env.BRASPAG_SPLIT_ONBOARDING,
    });
    const response = await baseUrl.get(`/api/subordinates/${cieloMerchantId}`, {
      headers: { authorization: `Bearer ${token.access_token}` },
    });
    return response;
  } catch (err) {
    return false;
  }
};

module.exports = {
  create,
  verify,
};
