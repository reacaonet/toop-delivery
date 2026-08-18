const splitData = (total) => {
  return [
    {
      SubordinateMerchantId: process.env.BRASPAG_CLIENT_ID,
      Amount: total.toFixed(2) * 100,
      Fares: {
        Mdr: 0.00001,
        Fee: 0.00001
      },
    }
  ];
}

module.exports = splitData;
