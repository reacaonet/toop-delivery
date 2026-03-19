const logPayment = require('./logPayment');

const paymentData = (
  paymentType,
  capture,
  provider,
  payTotal,
  paymentMethod,
  fingerprint,
  ipAddress,
  cartItens
) => {
  /**
   * Teste
   *  SandBox cardToken
      - Autorizado 6fb7a669aca457a9e43009b3d66baef8bdefb49aa85434a5adb906d3f920bfeA
      - Negado 6fb7a669aca457a9e43009b3d66baef8bdefb49aa85434a5adb906d3f920bfeB
   */

  /**
   * https://braspag.github.io//manual/antifraude#tabela-31-merchantdefineddata-(cybersource)
   */

  try {
    let total = payTotal.toFixed(2);
    total = parseInt(total * 100)
    return {
      Type: paymentType,
      Amount: total,
      Capture: capture,
      Currency: "BRL",
      Country: "BRA",
      Provider: provider,
      ServiceTaxAmount: 0,
      Installments: 1,
      Authenticate: false,
      SoftDescriptor: "Delivery",
      CreditCard: {
        CardToken: paymentMethod.cardToken,
        // CardToken: "6fb7a669aca457a9e43009b3d66baef8bdefb49aa85434a5adb906d3f920bfeA",
        Brand: flagCard(paymentMethod.flag),
      },
      FraudAnalysis: {
        // Sequence: "AnalyseFirst",
        SequenceCriteria: "OnSuccess",
        Provider: process.env.PROVIDER_CIELO_FRAUDANALYSIS,
        TotalOrderAmount: total,
        FingerPrintId: fingerprint,
        Browser: {
          IpAddress: ipAddress,
          BrowserFingerPrint: fingerprint,
          CookiesAccepted: false,
        },
        Cart: {
          isgift: false,
          returnsaccepted: true,
          Items: getItems(cartItens),
        },
        MerchantDefinedFields: [
          {
            Id: 4,
            Value: "Web",
          },
          /* cupom desconto
          {
            Id: 5,
            Value: 'Web',
          }
          */
        ],
      },
    };
  } catch (err) {
    console.log('Error PaymentData', err);
    logPayment(err, "method-paymentData");
    return false;
  }
};

const getItems = (cartItens) => {
  try {
    return cartItens.map((cart) => {
      let productName = "";
      let price = "";

      if (cart.product) {
        productName = cart.product.name;
      } else if (cart.foodProduct) {
        productName = cart.foodProduct.name;
      }

      if (cart.pricePromotion) {
        price = cart.pricePromotion;
      } else {
        price = cart.price;
      }

      return {
        Name: productName,
        Quantity: cart.amount,
        Sku: cart._id,
        UnitPrice: price,
      };
    });
  } catch (err) {
    return [];
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
