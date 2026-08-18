const CompanyDelivery = require('../../../models/Company/CompanyDeliveryModel');
const Cielo = require('../../../services/Payment/Cielo');
const Braspag = require('../../../services/Payment/Braspag');
const LogModel = require('../../../models/LogModel');

const split = async (companyId, company, price, paymentMethod, customerDB) => {
  try {
    let splitpayments;
    let total = price * 100;
    // total = total.toFixed(0);
    total = 3949

    const companyDelivery = await CompanyDelivery.findOne({ company: companyId });
    const verifyMerchantId = await Cielo.sales.verifySubordinates(companyDelivery.cieloMerchantId);

    if (!companyDelivery || !companyDelivery.cieloMerchantId || !verifyMerchantId.data) {
      const subordinates = await Cielo.sales.createSubordinates({
        CorporateName: company.name,
        FancyName: company.name,
        DocumentNumber: company.cnpj,
        DocumentType: "CNPJ",
        MerchantCategoryCode: "5719",
        ContactName: company.name,
        ContactPhone: company.phone,
        MailAddress: customerDB.person.email,
        BankAccount: getBankAccount(company),
        Address: getAddres(company),
        Agreement: {
          Fee: companyDelivery.fee,
          MerchantDiscountRates: [{
            PaymentArrangement: {
              Product: "CreditCard",
              Brand: paymentMethod.flag
            },
            InitialInstallmentNumber: 1,
            FinalInstallmentNumber: 1,
            Percent: companyDelivery.mdr
          }]
        },
        Notification: {
          Url: "https://www.economizebrasil.com.br/",
          Headers: [{
            Key: "key1",
            Value: "value1"
          }]
        }
      });

      await CompanyDelivery.findOneAndUpdate({ company },
        {
          cieloMerchantId: subordinates.data.MerchantId,
        }, {
        upsert: true,
      }
      );

      splitpayments = [{
        subordinatemerchantid: `${subordinates.data.MerchantId}`,
        amount: total,
        fares: {
          mdr: companyDelivery.mdr,
          fee: companyDelivery.fee,
        },
      }];
    } else {
      splitpayments = [{
        subordinatemerchantid: `${companyDelivery.cieloMerchantId}`,
        amount: total,
        fares: {
          mdr: companyDelivery.mdr,
          fee: companyDelivery.fee,
        },
      }];
    }

    return splitpayments;
  } catch (err) {
    console.log('Fail Split', err);
    logPayment(err, 'payment-cielo-method-split');
    return false;
  }
};

const getBankAccount = (company) => {
  try {
    return {
      Bank: company.bankInfo.bank,
      BankAccountType: company.bankInfo.banktype,
      Number: company.bankInfo.number,
      Operation: company.bankInfo.operation,
      VerifierDigit: company.bankInfo.digit,
      AgencyNumber: company.bankInfo.agency,
      AgencyDigit: company.bankInfo.agencydigit,
      DocumentNumber: company.cnpj,
      DocumentType: "CNPJ"
    }
  } catch (err) {
    console.log('Fail Bank Account', err);
    return {};
  }
};

const getAddres = (company) => {
  try {
    return {
      Street: company.addressDetail.street,
      Number: company.addressDetail.number,
      Complement: company.addressDetail.complement,
      Neighborhood: company.addressDetail.neighborhood,
      City: company.addressDetail.city,
      State: company.addressDetail.state,
      ZipCode: company.addressDetail.zipcode
    }
  } catch (err) {
    console.log('Fail getAddres', err);
    return {};
  }
}

const validateSplit = (companyDelivery) => {
  try {
    if (!companyDelivery)
      return false;

    if (
      !companyDelivery.cieloMerchantId ||
      companyDelivery.cieloMerchantId == "" ||
      companyDelivery.cieloMerchantId.lenght < 10
    ) {
      return false;
    }

    return true;
  } catch (err) {
    logPayment(err, 'payment-split-validateSplit');
    return false;
  }
};

const logPayment = (err, originError) => {
  try {
    Log.create({
      typeSystem: "BACKEND",
      typeLog: "ERROR",
      description: err,
      category: 'payment-cielo-split',
      originError: originError,
    });
  } catch (err) {
    console.log('Opps fail create log', err);
  }
};

module.exports = { split };
