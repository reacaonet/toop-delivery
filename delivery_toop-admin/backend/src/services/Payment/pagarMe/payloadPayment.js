/** MODELS */
const Franchise = require("../../../models/Franchise/FranchiseModel");
const Passenger = require("../../../models/Mobility/Passenger/PassengerModel");

/** UTILS */
const { round } = require("../../../utils");

const getItems = cartItens => {
  try {
    return cartItens.map(cart => {
      let productName = "";
      let price = "";

      if (cart.product) {
        productName = cart.product.name;
      } else if (cart.foodProduct) {
        productName = cart.foodProduct.name;
      }

      if (cart.pricePromotion) {
        price = Number(`${cart.pricePromotion}`) * 100;
      } else {
        price = Number(`${cart.price}`) * 100;
      }

      return {
        id: cart._id,
        title: productName,
        unit_price: price,
        quantity: cart.amount,
        tangible: true, // é um objeto (true) ou um serviço Digital
        category: "driver",
      };
    });
  } catch (err) {
    return [];
  }
};

const getSplit_rules = async payment => {
  try {
    const passenger = await Passenger.findById(payment.passenger).lean();
    const franchise = await Franchise.findById(passenger.franchise).lean();

    if (franchise && franchise.recipient_id) {
      const split_list = [];

      const franchise_split_id = franchise.recipient_id;
      const admin_split_id = process.env.PAGARME_RECIPIENT_ID;

      let feeAdm = 0;
      let feeFranchise = 0;
      let debitPriceAdm = 0;
      let debitPriceFranchise = 0;
      let franchiseAmount = 0;
      let admAmount = 0;

      // taxa do app
      if (payment.feeDebitPriceAdm) {
        feeAdm = round(payment.feeDebitPriceAdm, 2);
      }

      // valor do app
      if (payment.debitPriceAdm) {
        debitPriceAdm = round(payment.debitPriceAdm, 2);
      }

      // taxa da franquia
      if (payment.feeDebitPrice) {
        feeFranchise = round(payment.feeDebitPrice, 2);
      }

      // valor da franquia
      if (payment.debitPriceFranchise) {
        debitPriceFranchise = round(payment.debitPriceFranchise, 2);
      }

      franchiseAmount = payment.total - debitPriceAdm;
      admAmount = debitPriceAdm;

      /**  armazena o valor do split da franquia */
      split_list.push({
        recipient_id: franchise_split_id,
        liable: true, // Se o recebedor é responsável ou não pelo chargeback. Default true para todos os recebedores da transação.
        charge_processing_fee: true, // Se o recebedor será cobrado das taxas da criação da transação. Default true para todos os recebedores da transação.
        amount: round(franchiseAmount * 100, 0),
      });

      /** armazena o valor do split do dono/admin do aplicativo */
      split_list.push({
        recipient_id: admin_split_id,
        liable: false, // Se o recebedor é responsável ou não pelo chargeback. Default true para todos os recebedores da transação.
        charge_processing_fee: false, // Se o recebedor será cobrado das taxas da criação da transação. Default true para todos os recebedores da transação.
        amount: round(admAmount * 100, 0),
      });

      return split_list;
    } else {
      return [];
    }
  } catch (err) {
    console.log(err);

    return [];
  }
};

const payloadPagarMe = async (customer, paymentMethod, cart, cartItens, payTotal, delivery, cartTotal, payment) => {
  try {
    let name = "";

    if (customer.person && customer.person.name) {
      name = customer.person.name;
    } else if (customer.name) {
      name = customer.name;
    }

    let phone_numbers = null;

    if (customer.person && customer.person.phone) {
      // phone = customer.person.phone
      const ph = `${customer.person.phone}`.length < 11 ? `+55${customer.person.phone}` : `+${customer.person.phone}`;

      phone_numbers = [ph];
    } else if (customer.phone) {
      // phone = customer.phone
      phone_numbers = [`+${customer.phone}`];
    }

    let total = Number(payTotal.toFixed(2));
    total = parseInt(`${total * 100}`);

    let deliveryFee = cartTotal.deliveryFee ? cartTotal.deliveryFee : 0;

    let email = null;

    if (customer.email) {
      email = customer.email;
    } else if (customer.person && customer.person.email) {
      email = customer.person.email;
    }

    if (deliveryFee) {
      deliveryFee = Number(cartTotal.deliveryFee.toFixed(2));
      deliveryFee = parseInt(`${deliveryFee * 100}`);
    } else {
      deliveryFee = 0;
    }

    const payload = {
      reference_key: `${cart._id}`,
      amount: total,
      card_id: `${paymentMethod.cardToken}`,
      card_cvv: `${paymentMethod.verifierCode}`,
      payment_method: "credit_card",
      postback_url: `${process.env.PAYMENT_URL}/pagar-me/driver/status`,
      async: false,
      installments: 1,
      capture: true,
      soft_descriptor: "Driver",
      customer: {
        external_id: `${customer._id}`,
        name: `${name}`,
        email,
        country: "br",
        type: "individual",
        documents: [
          {
            type: `${paymentMethod.documentType}`.toLowerCase(),
            number: `${paymentMethod.document}`,
          },
        ],
        phone_numbers,
      },
      billing: {
        name: `${name}`,
        address: {
          country: `${delivery.country ? delivery.country.toLowerCase() : "br"}`,
          state: `${delivery.state ? delivery.state : ""}`,
          city: `${delivery.city ? delivery.city : ""}`,
          neighborhood: `${delivery.district ? delivery.district : ""}`,
          street: `${delivery.address ? delivery.address.substring(0, 35) : ""}`,
          street_number: `${delivery.streetNumber ? delivery.streetNumber : "1"}`,
          zipcode: `${delivery.zipcode ? delivery.zipcode.replace("-", "") : ""}`,
        },
      },
      // shipping: {
      //   name: `${name}`,
      //   fee: deliveryFee,
      //   // "delivery_date": moment().format('YYYY-MM-DD'),
      //   expedited: true,
      //   address: {
      //     country: `${
      //       delivery.country ? delivery.country.toLowerCase() : 'br'
      //     }`,
      //     state: `${delivery.state ? delivery.state : ''}`,
      //     city: `${delivery.city ? delivery.city : ''}`,
      //     neighborhood: `${delivery.district ? delivery.district : ''}`,
      //     street: `${
      //       delivery.address ? delivery.address.substring(0, 35) : ''
      //     }`,
      //     street_number: `${
      //       delivery.streetNumber ? delivery.streetNumber : '1'
      //     }`,
      //     zipcode: `${
      //       delivery.zipcode ? delivery.zipcode.replace('-', '') : ''
      //     }`,
      //   },
      // },
      items: getItems(cartItens),
      // split_rules: await getSplit_rules(payment), - comentado para poder realiza testes sem o split
    };

    return payload;
  } catch (err) {
    console.log("Error Payload", err);

    return null;
  }
};

module.exports = {
  getItems,
  getSplit_rules,
  payloadPagarMe,
};
