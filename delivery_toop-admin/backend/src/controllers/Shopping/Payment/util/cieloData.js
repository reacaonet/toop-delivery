const cieloData = (orderId, customer, payment) => {
  return {
    MerchantOrderId: orderId,
    Customer: customer,
    Payment: payment,
  };
};

module.exports = cieloData;
