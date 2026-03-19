const mongoose = require("mongoose");

/** Model */
const AgencyModel = require("../../../models/Finance/DigitalAccounts/AgencyModel");
const createAgency = require("./createAgency");

const get = async (franchise, createNotExist = false) => {
  try {
    let agency = await AgencyModel.findOne({ franchise: franchise });

    if (!agency && createNotExist)
      agency = await createAgency(franchise, "Agência");

    return agency;

    return false;
  } catch (err) {
    return false;
  }
};

module.exports = get;
