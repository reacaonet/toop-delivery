const axiosApi = require('../../axiosApi');
const generateToken = require('./Token');
const Log = require('../../../models/LogModel');

/**
 * Cancelamento Total enviar o Valor Total
 * Atenção: Cancelamento parcial disponível apenas para transações *CAPTURADAS*
 * Atenção: O retorno da API soma o total de cancelamentos Parciais, ou seja, se 3 cancelamentos de R$10,00 forem realizados,
 * a API apresentará em seu retorno um total de R$30,00 cancelados
*/
const cancel = async paymentId => {
  // try {
  //   axiosApi.defaults.baseURL = process.env.API_CIELO_E_COMERCE;
  //   axiosApi.defaults.headers.common['MerchantId'] = `${process.env.MERCHANT_ID}`;
  //   axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.MERCHANT_KEY}`;

  //   const response = await axiosApi.put(`1/sales/${paymentId}/void`);
  //   return response.data;
  // } catch (err) {
  //   if (err.response && err.response.data)
  //     console.log('Error Cielo cancel', err.response.data);
  //   else
  //     console.log('Error Cielo cancel', err);

  //   return false;
  // }

  try {
    const token = await generateToken();
    if (!token) {
      logCancel({paymentId}, 'payment-cancel-error-generate-token');
      return false;
    }

    const baseUrl = process.env.API_CIELO_E_COMERCE;
    axiosApi.defaults.headers.common['MerchantId'] = `${process.env.BRASPAG_CLIENT_ID}`;
    axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.BRASPAG_CLIENT_SECRET}`;
    axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;

    const response = await axiosApi.put(`${baseUrl}/1/sales/${paymentId}/void`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.data) {
      console.log('Error Cielo cancel', err.response.data);
    } else {
      console.log('Error Cielo cancel', err);
    }
    return false;
  }
}

const cancelPartial = async (paymentId, price) => {
  try {
    axiosApi.defaults.baseURL = process.env.API_CIELO_E_COMERCE;
    axiosApi.defaults.headers.common['MerchantId'] = `${process.env.MERCHANT_ID}`;
    axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.MERCHANT_KEY}`;

    const response = await axiosApi.put(`1/sales/${paymentId}/void?amount=${price}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.data)
      console.log('Error Cielo cancel Partial', err.response.data);
    else
      console.log('Error Cielo cancel Partial', err);

    return false;
  }
}

/**
* Exemplo Retorno
{
  "Status": 2,
  "ReasonCode": 0,
  "ReasonMessage": "Successful",
  "ProviderReturnCode": "0",
  "ProviderReturnMessage": "Operation Successful",
  "ReturnCode": "0",
  "ReturnMessage": "Operation Successful",
  "Links": [
      {
          "Method": "GET",
          "Rel": "self",
          "Href": "https://apiquerysandbox.cieloecommerce.cielo.com.br/1/sales/4d7be764-0e81-4446-b31e-7eb56bf2c9a8"
      },
      {
          "Method": "PUT",
          "Rel": "void",
          "Href": "https://apisandbox.cieloecommerce.cielo.com.br/1/sales/4d7be764-0e81-4446-b31e-7eb56bf2c9a8/void"
      }
  ]
}
*/


const logCancel = (err, originError) => {
  try {
    Log.create({
      typeSystem: "BACKEND",
      typeLog: "ERROR",
      description: err,
      category: 'payment-cielo-cancel',
      originError: originError,
    });
  } catch (err) {
    console.log('Opps fail create log', err);
  }
};



module.exports = {cancel, cancelPartial};
