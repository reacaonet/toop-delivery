const mongoose = require("mongoose");
const Person = require("../../models/Person/PersonModel");

const createAgency = require("./../../services/Finance/DigitalAccounts/createAgency");
const createAccount = require("./../../services/Finance/DigitalAccounts/createAccount");
const getAgencyFranchise = require("./../../services/Finance/DigitalAccounts/getAgencyFranchise");
const LogModel = require("./../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { isRoot, isCompany, isFranchise, franchise, franchises } = req;

    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    data.status = (typeof data.status === "string" && data.status === "") || data.status === null ? false : data.status;

    // const createDigitalAccount = data.createDigitalAccount;
    // delete data.createDigitalAccount;

    if (isFranchise) data.franchise = franchise;

    let person = await Person.create(data);

    // if (createDigitalAccount) {
    //   const agency = await getAgencyFranchise(person.franchise);
    //   if (agency) {
    //     await createAccount(agency._id, person._id, "PF", "Person");
    //   }
    // }

    person = await person.populate("city").populate("franchise").populate("company").execPopulate();

    return res.send({
      status: 200,
      message: "Person criado com sucesso",
      data: person,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Person/CreateController.js',
      error: err?.message,
      method: 'CreateController',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    return res.status(400).send({
      message: "Falha ao criar Person",
      Error: err.message,
    });
  }
};
