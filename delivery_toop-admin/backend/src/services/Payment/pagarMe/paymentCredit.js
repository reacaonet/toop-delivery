/** Service */
const apiPayment = require("../../paymentApi");
const { payloadPagarMe } = require("./payloadPayment");
const geoCode = require("../../maps/geoCode");

const paymentCredit = async body => {
  try {
    const customer = body.passenger;
    const cart = {
      _id: body.passenger._id,
    };

    const cartItens = [
      {
        _id: body.service,
        price: body.price,
        amount: 1,
        product: {
          name: `Corrida até ${body.destiny[0].address}`,
        },
      },
    ];

    const delivery = await geoCode(body.origin.latitude, body.origin.longitude);

    const payload = payloadPagarMe(customer, body.paymentMethod, cart, cartItens, body.price, delivery, 0);

    // return payload;
    // console.log("payload", JSON.stringify(payload));

    const { data: response } = await apiPayment.post("/pagar-me/transactions", payload);

    let respPay = response;

    if (response.data) {
      respPay = response.data;
    }

    return respPay;
  } catch (err) {
    let message = err.message;

    if (err.response && err.response.data) {
      if (err.response.data.message) {
        message = err.response.data.message;
      } else if (err.response.data.errors && Array.isArray(err.response.data.errors) && err.response.data.error.length > 0) {
        if (err.response.data.error[0].parameter_name) {
          message += `${err.response.data.error[0].parameter_name}`;
        }

        if (err.response.data.error[0].parameter_name) {
          message += ` ${err.response.data.error[0].message}`;
        }
      }
    }

    return {
      errMessage: message,
    };
  }
};

module.exports = paymentCredit;
