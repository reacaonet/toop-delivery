const axiosApi = require('../../axiosApi');
const generateToken = require('./Token');

function Capture() {
  const Debug = require('./Debug');

  async function total(paymentId= null, split = null, total = null) {
    try {
      const token = await generateToken();
      if (!token) {
        return false;
      }

      const baseUrl = process.env.API_CIELO_E_COMERCE;
      axiosApi.defaults.headers.common['MerchantId'] = `${process.env.BRASPAG_CLIENT_ID}`;
      axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.BRASPAG_CLIENT_SECRET}`;
      axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;

      let body = {};
      let url = '';

      if (split) {
        body.SplitPayments = split;
      }

      if (total) {
        url = `${baseUrl}/1/sales/${paymentId}/capture?amount=${total}`;
      } else {
        url = `${baseUrl}/1/sales/${paymentId}/capture`;
      }

      console.log({
        method: 'PUT',
        url: url,
        MerchantId: process.env.BRASPAG_CLIENT_ID,
        MerchantKey: process.env.BRASPAG_CLIENT_SECRET,
        Authorization: `Bearer ${token.access_token}`,
        body: JSON.stringify(body),
      });

      const response = await axiosApi.put(url, body);
      return response.data;
    } catch (err) {
      Debug().error('Capture-total', err);
      return false;
    }
  }

  return {
    total
  }
}

module.exports = Capture;
