/** MODELS */
const Franchise = require("../../models/Franchise/FranchiseModel");
const Driver = require("../../models/Mobility/Driver/DriverModel");

/** UTILS */
const { round } = require("../../utils");

const fee = async (total, franchise_id, driver_id = null) => {
  if (!franchise_id) return null;

  if (total <= 0) return null;

  const franchise = await Franchise.findById(franchise_id).lean();

  if (!franchise || !franchise.percentService) return null;

  let feeAdm = 0; // % taxa do admin
  let debitPriceAdm = 0; // valor taxa do admin
  let feeFranchise = 0; // % taxa da franquia
  let debitPriceFranchise = 0; // valor taxa da franquia

  // taxa do adm sobre o total
  feeAdm = franchise.percentService;
  debitPriceAdm = round(total * round(feeAdm / 100, 2), 2);

  if (driver_id) {
    const driver = await Driver.findById(driver_id).lean();

    if (driver && driver.percentService) {
      // taxa da franquia
      feeFranchise = driver.percentService;
      debitPriceFranchise = round(total * round(feeFranchise / 100, 2), 2);

      // taxa do adm sobre a franquia
      feeAdm = franchise.percentService;
      debitPriceAdm = round(debitPriceFranchise * round(feeAdm / 100, 2), 2);
    }
  }

  return { feeAdm, debitPriceAdm, feeFranchise, debitPriceFranchise };
};

module.exports = fee;
