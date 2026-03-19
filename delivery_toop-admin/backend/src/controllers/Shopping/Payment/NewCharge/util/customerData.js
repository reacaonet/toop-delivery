const logPayment = require('./logPayment');

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
      Phone: customer.phone,
    };
  } catch (err) {
    logPayment(err, "method-customerData");
    return false;
  }
};

module.exports = customerData;
