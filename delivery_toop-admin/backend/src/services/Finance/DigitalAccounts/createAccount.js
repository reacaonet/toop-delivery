/** Model */
const AccountModel = require("../../../models/Finance/DigitalAccounts/AccountModel");
const nextCode = require("./nextCode");
const getBank = require("./getBank");

const create = async (agency, _id, onModel, defaultCode = "") => {
  try {
    const bankDefault = await getBank();

    // obtem o proximo código da agência
    const code = defaultCode
      ? defaultCode
      : await nextCode.nextCodeAccount(bankDefault._id, agency);

    const account = await AccountModel.create({
      code,
      bank: bankDefault._id,
      agency,
      holder: _id,
      type: onModel === "Person" ? "PF" : "PJ",
      onModel,
    });

    return account;
  } catch (err) {
    console.log("Erro ao criar conta bancária => ", err);
    return false;
  }
};

module.exports = create;
