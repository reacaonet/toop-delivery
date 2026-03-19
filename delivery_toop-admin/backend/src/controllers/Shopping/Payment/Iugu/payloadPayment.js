const moment = require("moment");

/** UTILS */
const { round } = require("../../../../utils");

/** MODELS */
const Franchise = require("../../../../models/Franchise/FranchiseModel");
const Company = require("../../../../models/Company/CompanyModel");
const CompanyDelivery = require("../../../../models/Company/CompanyDeliveryModel");
const OrderStatus = require("../../../../models/Shopping/order/orderStatusModel");
const LogModel = require("../../../../models/LogModel");

const getItems = (cartItens, deliveryFee) => {
  try {
    const items = cartItens.map(cart => {
      let productName = "";
      let price = "";

      if (cart.product) {
        productName = cart.product.name;
      } else if (cart.foodProduct) {
        productName = cart.foodProduct.name;
      }

      if (cart.pricePromotion) {
        price = parseInt(Number(`${cart.pricePromotion}`) * 100);
      } else {
        price = parseInt(Number(`${cart.price}`) * 100);
      }

      if (cart.isPizza) {
        let totalComplement = 0;
        if (cart.check) {
          cart.check.map(check => {
            totalComplement = totalComplement + check.price;
          });
        }
        if (cart.radio) {
          cart.radio.map(radio => {
            totalComplement = totalComplement + radio.price;
          });
        }

        price = parseInt(Number(`${cart.price}`) * 100);
      }

      return {
        description: productName,
        price_cents: price,
        quantity: cart.amount,
      };
    });

    if (deliveryFee) {
      items.push({
        description: "Taxa de entrega",
        price_cents: deliveryFee,
        quantity: 1,
      });
    }

    return items;
  } catch (err) {
   return [];
  }
};

const getSplit_rules = async payment => {
  try {
    // const orderStatus = await OrderStatus.findOne({ shoppingCart: payment.shoppingCart }).lean();

    const companyDelivery = await CompanyDelivery.findOne({ company: payment.company, deletedAt: { $exists: false } }).lean();
    const company = await Company.findById(payment.company).lean();
    const franchise = await Franchise.findById(company.franchise).lean();

    if (company && company.recipient_id && franchise && franchise.recipient_id) {
      const split_list = [];

      const company_split_id = company.recipient_id;
      const franchise_split_id = franchise.recipient_id;
      const admin_split_id = process.env.PAGARME_RECIPIENT_ID;

      let feeAdm = 0;
      let feeFranchise = 0;
      let debitPriceAdm = 0;
      let debitPriceFranchise = 0;
      let companyAmount = 0;
      let franchiseAmount = 0;
      let admAmount = 0;

      let priceDelivery = 0;

      // taxa do app
      if (payment.feeAdm) {
        feeAdm = round(payment.feeAdm, 2);
      }

      // valor do app
      if (payment.debitPriceAdm) {
        debitPriceAdm = round(payment.debitPriceAdm, 2);
      }

      // taxa da franquia
      if (payment.fee) {
        feeFranchise = round(payment.fee, 2);
      }

      // valor da franquia
      if (payment.debitPrice) {
        debitPriceFranchise = round(payment.debitPrice, 2);
      }

      // valor do frete
      if (payment.priceDelivery) {
        priceDelivery = round(payment.priceDelivery, 2);
      }

      companyAmount = payment.total - priceDelivery - debitPriceFranchise;
      franchiseAmount = debitPriceFranchise - debitPriceAdm + priceDelivery;
      admAmount = debitPriceAdm;

      if (!companyDelivery.has_split) franchiseAmount = franchiseAmount + companyAmount;

      if (companyDelivery.has_split) {
        /**  armazena o valor do split da empreas */
        split_list.push({
          recipient_id: company_split_id,
          liable: false, // Se o recebedor é responsável ou não pelo chargeback. Default true para todos os recebedores da transação.
          charge_processing_fee: false, // Se o recebedor será cobrado das taxas da criação da transação. Default true para todos os recebedores da transação.
          amount: round(companyAmount * 100, 0),
        });
      }

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
      return null;
    }
  } catch (err) {
  console.log(err);
    return null;
  }
  return null;
};

const payload = async (customer, paymentMethod, cart, cartItens, payTotal, delivery, cartTotal, payment, typePayment) => {
  console.log(paymentMethod)
  try {
    let name = "";

    if (customer.person && customer.person.name) {
      name = customer.person.name;
    } else if (customer.name) {
      name = customer.name;
    }

    let phone = null;
    let phone_prefix = null;

    if (customer.person && customer.person.phone) {
      if (customer.person.phone.toString().substr(0, 2) === "55") {
        phone_prefix = customer.person.phone.toString().substr(2, 4);
        phone = customer.person.phone.toString().substr(4);
      } else {
        phone_prefix = customer.person.phone.toString().substr(0, 2);
        phone = customer.person.phone.toString().substr(2);
      }
    } else if (customer.phone) {
      if (customer.person.phone.substr(0, 2) === "55") {
        phone_prefix = customer.person.phone.toString().substr(2, 4);
        phone = customer.person.phone.toString().substr(4);
      } else {
        phone_prefix = customer.person.phone.toString().substr(0, 2);
        phone = customer.person.phone.toString().substr(2);
      }
    }
    let total = payTotal.toFixed(2);
    total = parseInt(total * 100);

    let deliveryFee = cartTotal.deliveryFee ? cartTotal.deliveryFee : 0;

    let email = null;
    if (customer.email) {
      email = customer.email;
    } else if (customer.person && customer.person.email) {
      email = customer.person.email;
    }

    if (deliveryFee) {
      deliveryFee = cartTotal.deliveryFee.toFixed(2);
      deliveryFee = parseInt(deliveryFee * 100);
    } else {
      deliveryFee = 0;
    }

    let payload = {
      customer_id: customer.iugu_id,
      amount: total,
      email: email,
      token: paymentMethod ? paymentMethod.cardToken : null,
      due_date: moment().utc().format("YYYY-MM-DD"),
      payable_with: "credit_card",
      payer: {
        name: `${name}`,
        email,
        cpf_cnpj: `${paymentMethod ? paymentMethod.document : ""}`,
        phone_prefix,
        phone,
        address: {
          country: `${delivery.country ? delivery.country.toLowerCase() : "BR"}`,
          state: `${delivery.state ? delivery.state : ""}`,
          city: `${delivery.city ? delivery.city : ""}`,
          district: `${delivery.district ? delivery.district : ""}`,
          street: `${delivery.address ? delivery.address.substring(0, 35) : ""}`,
          number: `${delivery.streetNumber ? delivery.streetNumber : "1"}`,
          zip_code: `${delivery.zipcode ? delivery.zipcode.replace("-", "") : ""}`,
        },
      },
      items: getItems(cartItens, deliveryFee),
    };

    if (typePayment === "PIX") {
      delete payload.token;
      delete payload.payer;

      payload.payable_with = "pix";
      payload.payer = {
        name: `${name}`,
      };
    }

    return payload;
  } catch (err) {
  console.log("Error Payload", err);
    return null;
  }
};

module.exports = payload;
