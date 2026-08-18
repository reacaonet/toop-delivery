const axiosApi = require('../../axiosApi');
const generateToken = require('./Token');

const getSaleCredit = async paymentId => {
  try {
    const token = await generateToken();
    if (!token) {
      return false;
    }

    const baseUrl = process.env.API_CIELO_E_COMERCE_QUERY;
    axiosApi.defaults.headers.common['MerchantId'] = `${process.env.BRASPAG_CLIENT_ID}`;
    axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.BRASPAG_CLIENT_SECRET}`;
    axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;

    const response = await axiosApi.get(`${baseUrl}/1/sales/${paymentId}`);
    return response.data;

  } catch (err) {
    if (err.response && err.response.data)
      console.log('Fail Get Pay Cielo', err.response.data);
    else
      console.log('Fail Cielo', err);
    return false;
  }
}

const merchantOrder = async merchantOrderid => {
  try {
    axiosApi.defaults.baseURL = process.env.API_CIELO_E_COMERCE_QUERY;
    axiosApi.defaults.headers.common['MerchantId'] = `${process.env.MERCHANT_ID}`;
    axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.MERCHANT_KEY}`;

    const response = await axiosApi.get(`1/sales?merchantOrderId=${merchantOrderid}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.data)
      console.log('Fail merchantOrder Pay Cielo', err.response.data);
    else
      console.log('Fail merchantOrder Pay Cielo ', err);

    return false;
  }
};

module.exports = {getSaleCredit, merchantOrder};
