const axiosApi = require('../../axiosApi');
const qs = require('qs');

const generateToken = async () => {
  try {
    // Quando for Split utilizar token BRASPAG

    const clienteId = process.env.BRASPAG_CLIENT_ID;
    const clienteSecret = process.env.BRASPAG_CLIENT_SECRET;
    const buff = Buffer.from(`${clienteId}:${clienteSecret}`, 'utf8')
    const base64 = buff.toString('base64');

    // console.log('clientId', clienteId);
    // console.log('clientSecret', clienteSecret);
    // console.log('Base64', base64);
    // console.log('Url POST', `${process.env.BRASPAG_OAUTH2_SERVER}/oauth2/token`);

    const baseUrl = process.env.BRASPAG_OAUTH2_SERVER;
    axiosApi.defaults.headers.common['Authorization'] = `Basic ${base64}`;
    axiosApi.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    const response = await axiosApi.post(
      `${baseUrl}/oauth2/token`,
      qs.stringify({ 'grant_type': 'client_credentials' })
    );
    return response.data;

  } catch (err) {
    if (err.response && err.response.data)
      console.log('Fail Generate Cielo Token ', err.response.data);
    else
      console.log('Fail Generate Cielo Token ', err);

    return false;
  }
};

module.exports = generateToken;
