function Transactions(){
  const axiosApi = require('../../axiosApi');
  const generateToken = require('../Cielo/Token');
  const Log = require('../../../models/LogModel');
  const Debug = require('./Debug');

  /**
   *
   * @param {Data inicial a ser consultada} initialDate
   * @param {Data final a ser consultada} finalDate
   * @param {Página a ser consultada} page
   * @param {Valores possíveis: 25, 50, 100} pageSize
   * @param {Scheduled - Pending - Settled - Error - Anticipated} eventStatus
   */
  async function getTransactions(initialDate, finalDate, page, pageSize, eventStatus, merchantId) {
    try {
      const token = await generateToken();
      if (!token) {
        logBraspag({}, 'braspag-error-generate-token');
        return false;
      }

      const baseUrl = process.env.BRASPAG_SPLIT;
      axiosApi.defaults.headers.common['MerchantId'] = `${process.env.BRASPAG_CLIENT_ID}`;
      axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.BRASPAG_CLIENT_SECRET}`;
      axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;

      let url = `schedule-api/transactions?initialCaptureDate=${initialDate}`;
      url += `&finalCaptureDate=${finalDate}`;
      url += `&pageIndex=${page}&pageSize=${pageSize}`;
      url += `&eventStatus=${eventStatus}`;

      if (merchantId) {
        url += `&merchantIds${merchantId}`;
      }

      const response = await axiosApi.get(`${baseUrl}/${url}`);

      // console.log({
      //   url: `${baseUrl}/schedule-api/transactions?initialCaptureDate=${initialDate}&finalCaptureDate=${finalDate}&pageIndex=${page}&pageSize=${pageSize}&eventStatus=${eventStatus}`,
      //   MerchantId: process.env.BRASPAG_CLIENT_ID,
      //   MerchantKey: process.env.BRASPAG_CLIENT_SECRET,
      //   Authorization: `Bearer ${token.access_token}`,
      //   response: response.data
      // });

      return response.data;

    } catch (err) {
      logBraspag({
        err: err.toString(),
        initialDate,
        finalDate,
        page,
        pageSize,
        eventStatus
      }, 'braspag-error-getTransactions');
      return false;
    }
  }

  /**
   * @param {* identificador da transação Cielo} paymentId
   * @param {* Identificador da Loja Cielo} merchantIds
   */
  async function getTransaction(paymentId, merchantIds) {
    try {
      const token = await generateToken();
      if (!token) {
        logBraspag({}, 'braspag-error-generate-token');
        return false;
      }

      const baseUrl = process.env.BRASPAG_SPLIT;
      axiosApi.defaults.headers.common['MerchantId'] = `${process.env.BRASPAG_CLIENT_ID}`;
      axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.BRASPAG_CLIENT_SECRET}`;
      axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;

      console.log('Url', `${baseUrl}/schedule-api/transactions/${paymentId}?merchantIds=${merchantIds}&merchantIds=${merchantIds}`);

      const response = await axiosApi.get(
        `${baseUrl}/schedule-api/transactions/${paymentId}?merchantIds=${merchantIds}`,
      );
      return response.data;
    } catch (err) {
      let error = null
      if (err.response && err.response.data) {
        error =  err.response.data;
      } else {
        error =  err;
      }

      logBraspag({
        err: error,
        paymentId
      }, 'braspag-error-getTransactions');
      return false;
    }
  }


  /**
   *
   * @param {Data inicial a ser consultada} initial
   * @param {Data final a ser consultada} final
   * @param {Página a ser consultada} page
   * @param {Valores possíveis: 25, 50, 100} pageSize
   * @param {Scheduled - Pending - Settled - Error - Anticipated} eventStatus
   */
  async function amountReceivable(initial, final, page, pageSize, eventStatus, merchantId = null) {
    try {
      const token = await generateToken();
      if (!token) {
        logBraspag({}, 'braspag-error-generate-token');
        return false;
      }

      const baseUrl = process.env.BRASPAG_SPLIT;
      axiosApi.defaults.headers.common['MerchantId'] = `${process.env.BRASPAG_CLIENT_ID}`;
      axiosApi.defaults.headers.common['MerchantKey'] = `${process.env.BRASPAG_CLIENT_SECRET}`;
      axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;

      let url = `schedule-api/events?initialForecastedDate=${initial}`;
      url += `&finalForecastedDate=${final}`;
      url += `&pageIndex=${page}&pageSize=${pageSize}`;
      url += `&eventStatus=${eventStatus}`;

      if (merchantId) {
        url += `&merchantIds${merchantId}`;
      }

      console.log('Url pesquisa', `${baseUrl}/${url}`);
      const response = await axiosApi.get(`${baseUrl}/${url}`);
      return response.data;
    } catch (err) {
      Debug('amountReceivable', err);
      logBraspag({
        err: err.toString(),
        initial,
        final,
        page,
        pageSize,
        eventStatus
      }, 'braspag-error-amountReceivable');
      return false;
    }
  }

  const logBraspag = (err, originError) => {
    try {
      Log.create({
        typeSystem: "BACKEND",
        typeLog: "ERROR",
        description: err,
        category: 'braspag-transaction',
        originError: originError,
      });
    } catch (err) {
      console.log('Opps fail create log', err);
    }
  };

  return {
    getTransactions,
    getTransaction,
    amountReceivable
  }
};

module.exports = Transactions;
