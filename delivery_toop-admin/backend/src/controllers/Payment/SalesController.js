const Cielo = require('../../services/Payment/Cielo');
const LogModel = require("../../models/LogModel");

const token = async (req, res) => {
  try {

    const token = await Cielo.token();
    return res.status(200).send({ token });

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Payment/SalesController.js',
      error: err?.message,
      method: 'token',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    console.log('Fail request', err);
    return res.status(400).end()
  }
}

const sales = async (req, res) => {
  try {
    const { price, orderId, paymentType, capture } = req.body;
    const response = await Cielo.sales.pay({
      price,
      orderId,
      capture,
      paymentType: (paymentType) ? paymentType : 'CreditCard',
    });

    return res.status(200).send({ response });
  } catch (err) {
    console.log('Fail request', err);
    return res.status(400).end()
  }
};

const saveCard = async (req, res) => {
  try {

    const postData = {
      CustomerName: 'Comprador Teste Toop',
      CardNumber: '4922578362168330',
      Holder: 'Comprador Toop',
      ExpirationDate: '12/2025',
      Brand: 'Visa',
    };

    const response = await Cielo.sales.saveCard(postData);

    return res.status(200).send({
      response: response
    });

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Payment/SalesController.js',
      error: err?.message,
      method: 'saveCard',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    console.log('Fail request', err);
    return res.status(400).end()
  }
};

const getCard = async (req, res) => {
  try {
    const token = 'cab59f1a-e074-474b-bd0d-3d55683957e7';
    const response = await Cielo.sales.getCard(token);

    return res.status(200).send({
      response: response
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Payment/SalesController.js',
      error: err?.message,
      method: 'getCard',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    console.log('Fail GET Card', err);
    return res.status(400).end()
  }
}

const zeroAuth = async (req, res) => {
  try {
    const postData = {
      CardNumber: 4922578362168330,
      Holder: "Alexsander Rosa",
      ExpirationDate: "12/2025",
      SecurityCode: "123",
      SaveCard: "false",
      Brand: "Visa",
      CardOnFile: {
        Usage: "First",
        Reason: "Recurring"
      }
    };

    const response = await Cielo.sales.zeroAuth(postData);

    return res.status(200).send({
      response: response
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Payment/SalesController.js',
      error: err?.message,
      method: 'zeroAuth',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    console.log('Fail zeroAuth', err);
    return res.status(400).end()
  }
}

// Consultar Status Pagamento Cartão Crédito
const getPaymentCredit = async (req, res) => {
  try {

    const { id } = req.params;
    //const paymentId = '61a6ccb8-a9ac-4e35-a8de-5e430997c39d';

    //const respMerchant = await Cielo.sales.getMerchantOrder(id);
    const response = await Cielo.sales.getPaymentCredit(id);

    return res.status(200).send({
      response: response
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Payment/SalesController.js',
      error: err?.message,
      method: 'getPaymentCredit',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    console.log('Fail getPaymentCredit', err);
    return res.status(400).end()
  }
};


// Valor a ser cobrado de uma transação Cartão Crédito
const captureCredit = async (req, res) => {
  try {

    const { paymentId } = req.body;
    const response = await Cielo.sales.capture(paymentId);

    return res.status(200).send({
      response: response
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Payment/SalesController.js',
      error: err?.message,
      method: 'captureCredit',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    console.log('Fail captureCredit', err);
    return res.status(400).end()
  }
}

const capturePartial = async (req, res) => {
  try {
    const { paymentId, price } = req.body;
    const response = await Cielo.sales.capturePartial(paymentId, price);
    return res.status(200).send({ response });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Payment/SalesController.js',
      error: err?.message,
      method: 'capturePartial',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    console.log('Fail captureCredit', err);
    return res.status(400).end()
  }
}

/**
 * Cancelamento pode ser o valor total ou parcial
 * quando cancelado ao consultar o pagamento tera um campo - VoidedAmount
 * com o valor devolvido
*/
const cancel = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const response = await Cielo.sales.cancel(paymentId);

    return res.status(200).send({ response });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Payment/SalesController.js',
      error: err?.message,
      method: 'cancel',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    console.log('Fail cancel', err);
    return res.status(400).end()
  };
};

const cancelPartial = async (req, res) => {
  try {
    const { paymentId, price } = req.body;
    const response = await Cielo.sales.cancelPartial(
      paymentId,
      price
    );

    return res.status(200).send({
      response: response
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Payment/SalesController.js',
      error: err?.message,
      method: 'cancelPartial',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    console.log('Fail cancel', err);
    return res.status(400).end()
  };
};

module.exports = {
  token,
  sales,
  saveCard,
  getCard,
  zeroAuth,
  getPaymentCredit,
  captureCredit,
  capturePartial,
  cancel,
  cancelPartial,
};
