const axiosApi = require('../../axiosApi');
const validator = require('validator').default;
const Log = require('../../../models/LogModel');
const generateToken = require('./Token');

const saveCard = async post => {
  try {
    const { CustomerName, CardNumber, Holder, ExpirationDate, Brand } = post
    let isMessage = validatePost(post);
    if (isMessage !== true) {
      logGenerateToken({message: isMessage}, 'paymentMethod-token-validate-fail');
      return isMessage;
    }

    // const token = process.env.CIELO_ACCESS_TOKEN;
    const token = await generateToken();
    if (!token) {
      return false;
    }

    const baseUrl = process.env.API_CIELO_E_COMERCE;
    axiosApi.defaults.headers.common['MerchantId'] = `${process.env.BRASPAG_CLIENT_ID}`;
    axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.BRASPAG_CLIENT_SECRET}`;
    axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;


    // if (token && token !== "" && token.length > 10) {
    //   axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;
    // } else {
    //   delete axiosApi.defaults.headers.common['Authorization'];
    // }

    const response = await axiosApi.post(`${baseUrl}/1/card/`, {
      CustomerName,
      CardNumber,
      Holder,
      ExpirationDate,
      Brand
    });

    const dataResponse = response.data;
    return dataResponse;

  } catch (err) {
    if (err.response && err.response.data) {
      logGenerateToken(err.response.data, 'paymentMethod-error-saveCard');
    }else {
      logGenerateToken(err, 'paymentMethod-error-saveCard');
    }

    return false;
  }
};

const validatePost = (post) => {
  // validar dados aqui
  /**
      Name	Texto	255	Sim	Nome do Comprador.
      CardNumber	Texto	16	Sim	Número do Cartão do Comprador.
      Holder	Texto	25	Sim	Nome do Comprador impresso no cartão.
      ExpirationDate	Texto	7	Sim	Data de validade impresso no cartão.
      Brand	Texto	10	Sim	Bandeira do cartão (Visa / Master / Amex / Elo / Aura / JCB / Diners / Discover).
  **/

  const { CustomerName, CardNumber, Holder, ExpirationDate, Brand } = post

  if (!validator.isLength(CustomerName, { min: 10, max: 50 })) {
    return {
      messageError: 'Informe o Nome impresso no Cartão'
    };
  }

  if (!validator.isLength(CardNumber, {min:16, max: 16})) {
    return {
      messageError: 'Informe o Número impresso no Cartão'
    };
  }

  if (!validator.isLength(ExpirationDate, {min:7, max: 7})) {
    return {
      messageError: 'Informe a Data de Expiração'
    };
  }

  if (!Brand) {
    return {
      messageError: 'Bandeira do Cartão não identificado'
    };
  }

  return true;
}

const getCard = async tokenCard => {
  try {
    axiosApi.defaults.baseURL = process.env.API_CIELO_E_COMERCE_QUERY;
    axiosApi.defaults.headers.common['MerchantId'] = `${process.env.MERCHANT_ID}`;
    axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.MERCHANT_KEY}`;

    const response = await axiosApi.get(`1/card/${tokenCard}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.data)
      console.log('Error getCard', err.response.data);
    else
      console.log('Error getCard', err);
    return false;
  }
};

/**
 * O Zero Auth é uma ferramenta de validação de cartões da API Cielo. A validação permite que o lojista saiba se o cartão
 * é valido ou não antes de enviar a transação para autorização, antecipando o motivo de uma provável não autorização..
 * Zero Auth não retorna ou analisa os seguintes itens:
 * Limite de crédito do cartão
 * Informações sobre o portador
 * Não aciona a base bancaria (dispara SMS so portador)
 * Suporte - Visa, MasterCard, Elo
 */
const zeroAuth = async post => {
  try {

    /*
      {
        "CardNumber":"1234123412341231",
        "Holder":"Alexsander Rosa",
        "ExpirationDate":"12/2021",
        "SecurityCode":"123",
        "SaveCard":"false",
        "Brand":"Visa",
        "CardOnFile":{
          "Usage":"First",
          "Reason":"Recurring"
        }
      }
    */

    const baseUrl = process.env.API_CIELO_E_COMERCE;
    axiosApi.defaults.headers.common['MerchantId'] = `${process.env.MERCHANT_ID}`;
    axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.MERCHANT_KEY}`;
    const response = await axiosApi.post(`${baseUrl}/1/zeroauth`, post);
    return response;

  } catch (err) {
    if (err.response && err.response.data)
      console.log('Error zeroAuth', err.response.data);
    else
      console.log('Error zeroAuth', err);
    return false;
  }
};

// Bandeira do Cartão
const cardBin = async cardNumber => {
  let addDebug = {};
  try {
    const token = process.env.CIELO_ACCESS_TOKEN;
    const baseUrl = process.env.API_CIELO_E_COMERCE_QUERY;
    axiosApi.defaults.headers.common['MerchantId'] = `${process.env.MERCHANT_ID}`;
    axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.MERCHANT_KEY}`;

    if (token && token !== "" && token.length > 10) {
      axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;
    } else {
      delete axiosApi.defaults.headers.common['Authorization'];
    }

    addDebug.axiosHeader = axiosApi.defaults.headers;
    const response = await axiosApi.get(`${baseUrl}/1/cardBin/${cardNumber}`);
    return response.data
  } catch (err) {
    if (err.response && err.response.data) {
      let message = cardBinStatusError(err.response.data);
      addDebug.message = message
      logGenerateToken({
        err: err.response.data,
        addDebug
      }, 'payment-error-cardBin');
      return {
        statusError: 400,
        message: message
      };
    } else {
      addDebug.message = 'Não foi possível pocessar informação'
      logGenerateToken({
        err,
        addDebug
      }, 'payment-error-cardBin');
      return {
        statusError: 400,
        message: addDebug.message
      };
    }
  }
};

const cardBinStatus = (index) => {
  try {
    let list = [];
    list['00'] = 'Analise autorizada';
    list['01'] = 'Bandeira não suportada';
    list['02'] = 'Cartão não suportado na consulta de bin';
    list['73'] = 'Afiliação bloqueada';

    return list[index];
  } catch (err) {
    return 'Falha ao Analisar Cartão'
  }
};

const cardBinStatusError = (brand) => {
  try {
    let info  = brand[0];

    if (!info || !info.Code) {
      return 'Não foi possível validar informações do cartão'
    }

    if (`${info.Code}` === '1') {
      //Voucher - Não suportado na consulta de bins
      return 'Bandeira não suportada'
    }

    if (`${info.Code}` === '2') {
      //Voucher - Não suportado na consulta de bins
      return 'Número do Cartão não suportado'
    }

    if (`${info.Code}` === '217') {
      //Voucher - Não suportado na consulta de bins
      return 'Número Bin maior que o esperado'
    }

    return info.Message;
  } catch (err) {
    return 'Não foi possível validar informações do cartão'
  }
}


const logGenerateToken = (err, originError) => {
  try {
    Log.create({
      typeSystem: "BACKEND",
      typeLog: "ERROR",
      description: err,
      category: 'paymentMethod-token',
      originError: originError,
    });
  } catch (err) {
    console.log('Opps fail create log', err);
  }
};


module.exports = {
  saveCard,
  getCard,
  zeroAuth,
  cardBin,
  cardBinStatus,
  cardBinStatusError,
};
