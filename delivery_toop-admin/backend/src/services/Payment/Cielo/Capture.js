const axiosApi = require('../../axiosApi');
const generateToken = require('./Token');

/*
* Confirmar o Valor a ser descontado na fatura do cartão
* price - Em centavos
*/
const confirmCapture = async (paymentId, amount) => {
  try {
    const token = await generateToken();
    if (!token) {
      return false;
    }

    const baseUrl = process.env.API_BRASPAG_E_COMERCE;
    axiosApi.defaults.headers.common['MerchantId'] = `${process.env.BRASPAG_CLIENT_ID}`;
    axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.BRASPAG_CLIENT_SECRET}`;
    // axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;
    axiosApi.defaults.headers.common['Authorization'] = null;

    // console.log(process.env.BRASPAG_CLIENT_ID, process.env.BRASPAG_CLIENT_SECRET);
    // console.log(`${baseUrl}/v2/sales/${paymentId}/capture?amount=${amount}`);


    // const response = await axiosApi.put(`${baseUrl}/1/sales/${paymentId}/capture`, split);
    const response = await axiosApi.put(`${baseUrl}/v2/sales/${paymentId}/capture?amount=${amount}`, {
      MerchantKey: process.env.BRASPAG_CLIENT_SECRET,
      MerchantId: process.env.BRASPAG_CLIENT_ID,
    });

    return response.data;
  } catch (err) {
    if (err.response && err.response.data)
      console.log('Error confirmCapture', err.response.data);
    else
      console.log('Error confirmCapture', err);

    return false;
  }
}

/**
 * Exemplo Retorno
 * {
    "Status": 2,
    "ReasonCode": 0,
    "ReasonMessage": "Successful",
    "ProviderReturnCode": "6",
    "ProviderReturnMessage": "Operation Successful",
    "ReturnCode": "6",
    "ReturnMessage": "Operation Successful",
    "Links": [
        {
            "Method": "GET",
            "Rel": "self",
            "Href": "https://apiquerysandbox.cieloecommerce.cielo.com.br/1/sales/8b1d43ee-a918-40d2-ba62-e5665e7ccbd3"
        },
        {
            "Method": "PUT",
            "Rel": "void",
            "Href": "https://apisandbox.cieloecommerce.cielo.com.br/1/sales/8b1d43ee-a918-40d2-ba62-e5665e7ccbd3/void"
        }
    ]
  }
 */

 /**
  O ato de capturar um valor menor que o valor autorizado.Esse modelo de captura pode ocorrer apenas 1 vez por transação.
  Exemplo
    "SplitPayments":[
        {
            "SubordinateMerchantId": "f2d6eb34-2c6b-4948-8fff-51facdd2a28f",
            "Amount": 5000,
            "Fares": {
                "Mdr": 5,
                "Fee": 30
            }
        },
      ]
 **/
const partial = async (paymentId, price, SplitPayments = {}) => {
  try {
    const token = await generateToken();
    if (!token) {
      return false;
    }

    let split = {};
    if (SplitPayments !== null) {
      split = {
        'SplitPayments': SplitPayments,
      };
    }

    const baseUrl = process.env.API_CIELO_E_COMERCE;
    axiosApi.defaults.headers.common['MerchantId'] = `${process.env.BRASPAG_CLIENT_ID}`;
    axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.BRASPAG_CLIENT_SECRET}`;
    axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;

    const response = await axiosApi.put(`${baseUrl}/1/sales/${paymentId}/capture?amount=${price}`, split);
    return response.data;
  } catch (err) {
    if (err.response && err.response.data)
      console.log('Error Capture partial', err.response.data);
    else
      console.log('Error Capture partial', err);

    return false;
  }
};

module.exports = {confirmCapture, partial};
