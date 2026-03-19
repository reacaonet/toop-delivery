const axiosApi = require('../../axiosApi');
const generateToken = require('./Token');

function Sales() {

  async function pay(postData){
    try {
      const token = await generateToken();
      if (!token) {
        return false;
      }

      if (
        postData
        && postData.Payment
        && postData.Payment.CreditCard
        && postData.Payment.CreditCard.Brand
        && (postData.Payment.CreditCard.Brand === 'MASTERCARD')
      ) {
        postData.Payment.CreditCard.Brand = 'MASTER';
      }

      const baseUrl = process.env.API_CIELO_E_COMERCE;
      axiosApi.defaults.headers.common['MerchantId'] = `${process.env.BRASPAG_CLIENT_ID}`;
      axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.BRASPAG_CLIENT_SECRET}`;
      axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;

      const response = await axiosApi.post(`${baseUrl}/1/sales/`, postData);
      return response.data;

    } catch (err) {
      let error = err;
      if (err.response && err.response.data) {
        error = err.response.data;
      }

      console.log('Braspag Sales Error Pay', error);
      return false;
    }
  }

  return {
    pay,
  }
}

module.exports = Sales;
