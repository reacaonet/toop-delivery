/** Model */
const AgencyModel = require("../../../models/Finance/DigitalAccounts/AgencyModel");
const nextCode = require("./nextCode");
const getBank = require("./getBank");
const createAccount = require("./createAccount");

const create = async (_id, name) => {
  try {
    const bank = await getBank();

    // obtem o proximo código da agência
    const code = await nextCode.nextCodeAgency();
    name = `${name} - ${code}`;

    const agency = await AgencyModel.create({
      franchise: _id,
      code,
      bank: bank._id,
      name,
      status: true,
    });

    // cria a conta padrão da franquia
    await createAccount(agency._id, _id, "Franchise", "0000001");

    return agency;
  } catch (err) {
    console.log("Erro ao criar agência => ", err);
    return false;
  }
};

module.exports = create;
