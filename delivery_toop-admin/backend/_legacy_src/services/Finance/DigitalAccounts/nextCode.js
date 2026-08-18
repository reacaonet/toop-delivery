const AccountModel = require("../../../models/Finance/DigitalAccounts/AccountModel");
const AgencyModel = require("../../../models/Finance/DigitalAccounts/AgencyModel");

const nextCodeAccount = async (bank, agency) => {
  let lastCode = await AccountModel.aggregate([
    {
      $match: {
        bank: { $in: [bank] },
        agency: { $in: [agency] },
      },
    },
    {
      $group: {
        _id: null,
        code: { $max: { $toInt: "$code" } },
      },
    },
  ]);

  if (lastCode[0] && lastCode[0].code)
    return (parseInt(lastCode[0].code) + 1).toString().padStart(7, "0");
  return "0000002";
};

const nextCodeAgency = async () => {
  let lastCode = await AgencyModel.aggregate([
    {
      $group: {
        _id: null,
        code: {
          $max: { $toInt: "$code" },
        },
      },
    },
  ]);

  if (lastCode[0] && lastCode[0].code)
    return (parseInt(lastCode[0].code) + 1).toString().padStart(4, "0"); //formata no estilo 0002
  return "0002";
};

module.exports = { nextCodeAccount, nextCodeAgency };
