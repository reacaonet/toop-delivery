const mongoose = require("mongoose");
const PaymentMethod = require("../../../models/Shopping/PaymentMethodModel");
const Customer = require("../../../models/CustomerModel");
const DeliveryAddress = require("../../../models/Customer/DeliveryAddressModel");
const moment = require("moment");
const validator = require("validator").default;
const Cielo = require("../../../services/Payment/Cielo");
const LogModel = require("../../../models/LogModel");
const paymentApi = require("../../../services/paymentApi");

const gateway = process.env.GATEWAY_PAYMENT;

module.exports = async (req, res) => {
  try {
    const data = req.body;
    const { customer } = req.params;
    data._id = new mongoose.Types.ObjectId().toHexString();
    let addDebug = {};

    addDebug.body = req.body;
    addDebug.params = req.params;

    if (!customer || !mongoose.Types.ObjectId.isValid(customer)) {
      addDebug.message = "Id do cliente inválido";
      logPaymentMethod(addDebug, "paymentMethod-not-customer");
      return res.status(400).send({
        message: addDebug.message,
      });
    }

    let msgValid = validCreatePost(data);
    if (msgValid !== null) {
      addDebug.message = msgValid;
      logPaymentMethod(addDebug, "paymentMethod-not-valid");
      return res.status(400).send({ message: msgValid });
    }

    let firstNumbers = data.cartNumber.slice(0, 6);
    // const brand =  await Cielo.sales.cardBin(firstNumbers);

    const { data: dataBrand } = await paymentApi.get(`/payment/binCard/${firstNumbers}`);
    const brand = dataBrand.data;
    addDebug.firstNumbers = firstNumbers;
    addDebug.brand = brand;

    if (brand === null) {
      logPaymentMethod(addDebug, "paymentMethod-not-brand");
      return res.status(400).send({
        message: "Não foi possível validar informações do cartão",
      });
    }

    if (brand && brand.statusError) {
      addDebug.message = brand.message;
      logPaymentMethod(addDebug, "paymentMethod-err-brand");
      return res.status(400).send({
        message: addDebug.message,
      });
    }

    if (!brand.Status) {
      addDebug.message = "Não foi possível validar informações do cartão";
      logPaymentMethod(addDebug, "paymentMethod-not-status-brand");
      return res.status(400).send({
        message: addDebug.message,
      });
    }

    if (brand.Status && `${brand.Status}` !== "00") {
      logPaymentMethod(addDebug, "paymentMethod-status-brand");
      return res.status(400).send({ message: Cielo.sales.cardBinStatus(brand.Status) });
    }

    let dataToken;
    try {
      let dataResponse = null;

      if (gateway === "BRASPAG") {
        dataResponse = await braspagCard(data);
        dataToken = dataResponse.data;
      } else if (gateway === "PAGARME") {
        dataResponse = await pagarmeCard(data);
        dataToken = dataResponse.data;
      } else if (gateway === "IUGU") {
        dataResponse = await iuguCard(data, customer);

        if (dataResponse.data) {
          dataToken = { data: dataResponse.data };
        } else {
          logPaymentMethod(addDebug, "paymentMethod-fail-create-token");
          return res.status(400).send({
            message: "Não foi possivel cadastrar cartão de crédito",
          });
        }
      }
    } catch (err) {
      dataToken = err.response && err.response.data ? err.response.data : null;
    }

    addDebug.token = dataToken;
    const token = dataToken.data ? dataToken.data : null;

    if (token && token.messageError) {
      addDebug.message = token.messageError;
      logPaymentMethod(addDebug, "paymentMethod-fail-create-token");
      return res.status(400).send({
        message: addDebug.message,
      });
    }

    if (gateway === "BRASPAG" && (!token || token === false || !token.CardToken)) {
      addDebug.message = "Verifique as informações enviadas do Cartão, e tente novamente!";
      logPaymentMethod(addDebug, "paymentMethod-fail-create-token");
      return res.status(400).send({
        message: addDebug.message,
      });
    }

    if (gateway === "PAGARME" && (!token || token === false || !token.id)) {
      addDebug.message = "Verifique as informações enviadas do Cartão, e tente novamente!";
      logPaymentMethod(addDebug, "paymentMethod-fail-create-token");
      return res.status(400).send({
        message: addDebug.message,
      });
    }

    if (gateway === "IUGU" && (!token || token === false || !token.id)) {
      addDebug.message = "Verifique as informações enviadas do Cartão, e tente novamente!!";
      logPaymentMethod(addDebug, "paymentMethod-fail-create-token");
      return res.status(400).send({
        message: addDebug.message,
      });
    }

    let gatewayToken = null;

    if (gateway === "BRASPAG") {
      gatewayToken = token.CardToken;
    } else if (gateway === "PAGARME") {
      gatewayToken = token.id;
    } else if (gateway === "IUGU") {
      gatewayToken = token.id;
    }

    data.cartNumber = data.cartNumber.replace(/\d(?=\d{4})/g, "*");
    data.customer = customer;
    data.flag = brand.Provider.toLocaleUpperCase();
    // data.flag = bandeira.toLocaleUpperCase();
    data.cardToken = gatewayToken;
    data.isMain = true;
    data.gateway = gateway;

    // Modificar cartão principal
    const payMethod = await PaymentMethod.create(data);

    if (payMethod && payMethod._id) {
      await PaymentMethod.updateMany({ customer: customer, _id: { $ne: payMethod._id } }, { isMain: false });
    }

    return res.send({
      status: 200,
      message: "Método de pagamento criado com sucesso",
      data: payMethod,
    });
  } catch (err) {
    await logPaymentMethod(err, "paymentMethod-error");
    return res.status(400).send({
      message: "Falha ao criar método de pagamento",
      err: err.message,
    });
  }
};

const validCreatePost = data => {
  try {
    if (!data.nameOnCard || validator.isEmpty(data.nameOnCard)) {
      return "Informe o Nome Impresso no Cartão";
    }

    if (validator.isLength(`${data.nameOnCard}`, { min: 12, max: 255 }) === false) {
      return "Nome no Cartão deve conter entre 13 a 100 caracteres";
    }

    if (!data.cartNumber || validator.isEmpty(data.cartNumber)) {
      return "Informe os Números do Cartão";
    }

    if (validator.isLength(data.cartNumber, { min: 16, max: 16 }) === false) {
      return "Números do Cartão devem contenter 16 caracteres";
    }

    if (!data.valid || moment(data.valid, "YYYY-MM-DD", true).isValid() === false) {
      return "Informe uma validade";
    }

    if (!data.verifierCode || validator.isLength(`${data.verifierCode}`, { min: 3, max: 4 }) === false) {
      return "Informe o código de Verificação corretamente";
    }

    if (!data.documentType) {
      return "Informe o Tipo do Documento";
    }

    if (!data.document) {
      return "Informe o Documento";
    }

    return null;
  } catch (err) {
    console.log(err);
    return "Dados do Cartão Inválido";
  }
};

const logPaymentMethod = (err, originError) => {
  try {
    Log.create({
      typeSystem: "BACKEND",
      typeLog: "ERROR",
      description: err,
      category: "createPaymentMethod",
      originError: originError,
    });
  } catch (err) {
    console.log("Opps fail create log", err);
  }
};

const braspagCard = async data => {
  return await paymentApi.post("/payment/card", {
    CustomerName: data.nameOnCard,
    CardNumber: data.cartNumber,
    Holder: data.nameOnCard.slice(0, 25),
    ExpirationDate: moment(data.valid, "YYYY-MM-DD").format("MM/YYYY"),
    Brand: brand.Provider,
    SecurityCode: data.verifierCode,
  });
};

const pagarmeCard = async data => {
  return await paymentApi.post("/pagar-me/cards", {
    CardNumber: data.cartNumber,
    ExpirationDate: moment(data.valid, "YYYY-MM-DD").format("MM/YY"),
    SecurityCode: data.verifierCode,
    Holder: data.nameOnCard.slice(0, 25),
  });
};

const iuguCard = async (data, customer_id) => {
  let customer = await Customer.findById(customer_id).populate("person");

  if (!customer.iugu_id) {
    const payload = await payloadCustomer(customer, data);

    const response = await paymentApi.post("/iugu/customers", payload);

    if (response.data.id) {
      customer.iugu_id = response.data.id;
      await Customer.updateOne(
        { _id: customer_id },
        {
          iugu_id: response.data.id,
        },
      );
    }
  }

  const card = await paymentApi.post(`/iugu/customers/${customer.iugu_id}/credit-cards`, {
    token: data.iugu_id,
    name: `Cartão de ${customer.person && customer.person.name ? customer.person.name : customer.name}`,
  });

  return card;
};

const payloadCustomer = async (customer, paymentMethod) => {
  try {
    let name = "";

    const delivery = await DeliveryAddress.findOne({
      customer: customer._id,
      main: true,
    }).lean();

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
      if (customer.person.phone.toString().substr(0, 2) === "55") {
        phone_prefix = customer.person.phone.toString().substr(2, 4);
        phone = customer.person.phone.toString().substr(4);
      } else {
        phone_prefix = customer.person.phone.toString().substr(0, 2);
        phone = customer.person.phone.toString().substr(2);
      }
    }

    let email = null;
    if (customer.email) {
      email = customer.email;
    } else if (customer.person && customer.person.email) {
      email = customer.person.email;
    }

    let payload = {
      name: `${name}`,
      email,
      cpf_cnpj: `${paymentMethod.document}`,
      phone_prefix,
      phone,
      country: `${delivery.country ? delivery.country.toLowerCase() : "BR"}`,
      state: `${delivery.state ? delivery.state : ""}`,
      city: `${delivery.city ? delivery.city : ""}`,
      district: `${delivery.district ? delivery.district : ""}`,
      street: `${delivery.address ? delivery.address.substring(0, 35) : ""}`,
      number: `${delivery.streetNumber ? delivery.streetNumber : "1"}`,
      zip_code: `${delivery.zipcode ? delivery.zipcode.replace("-", "") : ""}`,
    };

    return payload;
  } catch (err) {
    console.log("Error Payload Customer", err);
    return null;
  }
};
