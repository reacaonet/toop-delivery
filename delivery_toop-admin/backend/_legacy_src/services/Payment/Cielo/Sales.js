const axiosApi = require('../../axiosApi');
const generateToken = require('./Token');
const Log = require('../../../models/LogModel');

const pay = async postData => {
  try {
    const token = await generateToken();
    if (!token) {
      logPayment(postData, 'payment-error-generate-token');
      return false;
    }

    // Valid card MASTERCARD to MASTER
    if (
      postData
      && postData.Payment
      && postData.Payment.CreditCard
      && postData.Payment.CreditCard.Brand
      && (postData.Payment.CreditCard.Brand === 'MASTERCARD')
    ) {
      postData.Payment.CreditCard.Brand = 'MASTER';
    }

    /*
    const saleData = {
      MerchantOrderId: postData.orderId,
      Customer: customer(),
      Payment: payment(postData),
    };
    */

    const baseUrl = process.env.API_CIELO_E_COMERCE;
    axiosApi.defaults.headers.common['MerchantId'] = `${process.env.BRASPAG_CLIENT_ID}`;
    axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.BRASPAG_CLIENT_SECRET}`;
    axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;
    //const response = await axiosApi.post(`${baseUrl}/1/sales/`, saleData);
    const response = await axiosApi.post(`${baseUrl}/1/sales/`, postData);
    return response.data;

  } catch (err) {
    if (err.response && err.response.data)
      logPayment(err.response.data, 'error-connect-cielo');
    else
      logPayment(err, 'error-connect-cielo');

      return false;
  }
};


const logPayment = (err, originError) => {
  try {
    Log.create({
      typeSystem: "BACKEND",
      typeLog: "ERROR",
      description: err,
      category: 'payment-cielo-pay',
      originError: originError,
    });
  } catch (err) {
    console.log('Opps fail create log', err);
  }
};

const customer = () => {
  return {
    Name: "Toop",
    Email: "compradorteste@teste.com",
    Identity: "12345678900",
    IdentityType: "CPF",
    Birthdate: "1991-01-02",
    Address: {
      Street: "Rua Toop",
      Number: "123",
      Complement: "AP 123",
      ZipCode: "12345987",
      City: "Goiânia",
      State: "Go",
      Country: "BRA"
    },
    DeliveryAddress: {
      Street: "Rua Teste",
      Number: "123",
      Complement: "AP 123",
      ZipCode: "12345987",
      City: "Goiânia",
      State: "GO",
      Country: "BRA"
    }
  }
};

const payment = postData => {
  // CardToken - CardNumber Criptografado
  /*
  SandBox
      - Autorizado 6fb7a669aca457a9e43009b3d66baef8bdefb49aa85434a5adb906d3f920bfeA
      - Negado 6fb7a669aca457a9e43009b3d66baef8bdefb49aa85434a5adb906d3f920bfeB

  "CreditCard":{
      "CardToken":"6e1bf77a-b28b-4660-b14f-455e2a1c95e9",
      "SecurityCode":"262",
      "Brand":"Visa"
  }
  */

  const provider = (process.env.production) ? process.env.PROVIDER_PAYMENT_CIELO : 'Simulado'
  const payParams = {
    Type: postData.paymentType,
    Amount: postData.price,
    Capture: postData.capture,
    Currency: "BRL",
    Country: "BRA",
    Provider: provider,
    ServiceTaxAmount: 0,
    Installments: 1,
    Authenticate: false,
    SoftDescriptor: "economizeBr",
    CreditCard: {
      CardNumber: "0000000000000004",
      cvv: 123,
      Holder: 'Teste Holder',
      ExpirationDate: '12/2030',
      SecurityCode: 123,
      SaveCard: false,
      // (Visa / Master / Amex / Elo / Aura / JCB / Diners / Discover / Hipercard / Hiper)
      Brand: 'Visa',
      // Não obrigatório
      //CardOnFile: {
      /**
       * First se o cartão foi armazenado e é seu primeiro uso
      * Used se o cartão foi armazenado e ele já foi utilizado anteriormente em outra transação
      */
      //Usage: 'Used',
      //Reason: 'Unscheduled', // Compra recorrente sem agendamento (ex. aplicativos de serviços)
      //}
    },
  }

  payParams.FraudAnalysis = paymentFraudAnalysis(postData.price);
  payParams.SplitPayments = splitPayments();
  return payParams;
}

const paymentFraudAnalysis = (totalPrice) => {
  return {
    TotalOrderAmount: totalPrice,
    Provider: "Cybersource",
    Shipping: {
      Addressee: "EconomizeBR"
    },
    browser: {
      ipaddress: "200.175.248.183",
      browserfingerprint: "927241847"
    },
    MerchantDefinedFields: [
      {
        Id: "001",
        Value: "Compra Leite"
      }
    ],
  };
};

const splitPayments = () => {
  // SplitPayments
  return [
    {
      SubordinateMerchantId: "6063a330-9175-4fba-ade3-2059fd56fa2c",
      Amount: 1000,
      Fares: {
        Mdr: 3,
        Fee: 0,
      }
    }
  ];
};

module.exports = pay;
