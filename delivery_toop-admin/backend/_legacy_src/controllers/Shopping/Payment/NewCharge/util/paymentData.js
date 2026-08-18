const LogModel = require("./../../../../../models/LogModel");

const logPayment = require('./logPayment');

const paymentData = (
  paymentType,
  capture,
  provider,
  payTotal,
  paymentMethod,
  customer,
) => {
  try {
    let total = payTotal.toFixed(2);
    total = parseInt(total * 100);

    let name = customer.person.name;
    let accept = `${process.env.PROVIDER_PAYMENT_CIELO}`;
    accept = accept.trim();

    if (`${accept}` == "Simulado") {
      name += " Accept";
    }

    return {
      Type: paymentType,
      Amount: total,
      Capture: capture,
      Installments: 1,
      SoftDescriptor: "Toop",
      Currency: "BRL",
      Country: "BRA",
      Provider: provider,
      ServiceTaxAmount: 0,
      Authenticate: false,
      CreditCard: {
        CardToken: paymentMethod.cardToken,
        Brand: flagCard(paymentMethod.flag),
      },
      FraudAnalysis: {
        SequenceCriteria: "OnSuccess",
        Provider: process.env.PROVIDER_CIELO_FRAUDANALYSIS,
        Shipping: {
          Addressee: name,
        },
        TotalOrderAmount: total,
        MerchantDefinedFields: [
          {
            Id: 4,
            Value: "Portal", // um agente fazendo a compra para o cliente
          },
          {
            Id: 7,
            Value: "Toop", // Vendedor
          },
          {
            Id: 23,
            Value: paymentMethod.cartNumber.slice(-4)
          },
          {
            Id: 41,
            Value: 'CPF' // Tipdo Documento
          }
        ],
      },
    };
  } catch (err) {
    console.log('Error PaymentData', err);
    logPayment(err, "method-paymentData");
    return false;
  }
};


const flagCard = (flag) => {
  try {
    if (flag === 'MASTERCARD') {
      return 'MASTER';
    }

    return flag;
  } catch (err) {
    return flag;
  }
}

module.exports = paymentData;
