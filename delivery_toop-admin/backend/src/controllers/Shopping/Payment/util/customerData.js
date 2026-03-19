const logPayment = require('./logPayment');
const LogModel = require("../../../../models/LogModel");

const customerData = (customer, paymentMethod) => {
  try {
    let name = customer.person.name;
    let accept = `${process.env.PROVIDER_PAYMENT_CIELO}`;
    accept = accept.trim();

    if (`${accept}` == "Simulado") {
      name += " Accept";
    }

    return {
      Name: name,
      Email: customer.email,
      Identity: paymentMethod.document,
      IdentityType: paymentMethod.documentType,
      //Birthdate: '1991-01-10',
      Phone: customer.phone,
      // Address: {
      //   Street: delivery.address.slice(0, 53),
      //   Number: 5,
      //   State: "GO",
      //   City: "Goiânia",
      //   Country: "BR",
      //   District: "Setor Bueno",
      // },
      // DeliveryAddress: {
      //   Street: delivery.address.slice(0, 53),
      //   Number: 5,
      //   State: "GO",
      //   City: "Goiânia",
      //   Country: "BR",
      //   District: "Setor Bueno",
      // },
    };
  } catch (err) {
    logPayment({
      customer,
      paymentMethod,
      message: err.message,
    }, "method-customerData");
    return false;
  }
};

module.exports = customerData;
