const Franchise = require("../../models/Franchise/FranchiseModel");
const ServiceModel = require("../../models/Mobility/Service/ServiceModel");

/** UTILS */
const { round } = require("../../utils");

const fee = async (total, franchise_id, serviceId) => {
  if (!franchise_id) return null;

  if (total <= 0) return null;

  const franchise = await Franchise.findById(`${franchise_id}`.toString()).lean();

  if (!franchise || !franchise._id) {
    return null;
  }

  /* Admin */
  let feeAdm = 0; // % taxa do admin
  let feeAdmValue = 0; // Taxa R$ fixa Admin
  let debitPriceAdm = 0; // valor Total taxa do admin ( feeAdm +  feeAdmValue)
  /* Frachise */
  let feeFranchise = 0; // % taxa da franquia
  let feeFranchiseValue = 0; // Taxa R$ fixa Franquia (cobrado por serviço)
  let debitPriceFranchise = 0; // valor total taxa da franquia

  // taxa do adm sobre o total
  feeAdm = franchise.percentService || 0;
  feeAdmValue = franchise.fixedservicefee || 0;

  if (feeAdm > 0) {
    debitPriceAdm = round(total * round(feeAdm / 100, 2), 2);
  }

  if (feeAdmValue > 0) {
    debitPriceAdm += Number(feeAdmValue);
    debitPriceAdm = round(debitPriceAdm, 2);
  }

  if (serviceId) {
    const service = await ServiceModel.findById(`${serviceId}`.toString()).lean();

    if (service && service._id) {
      if (service.valueByPercentage && service.valueByPercentage > 0) {
        feeFranchise = Number(service.valueByPercentage);
        debitPriceFranchise += round(total * round(feeFranchise / 100, 2), 2);
      }

      if (service.fixedValue && service.fixedValue > 0) {
        feeFranchiseValue = Number(service.fixedValue);
        debitPriceFranchise += feeFranchiseValue;
        debitPriceFranchise = round(debitPriceFranchise, 2);
      }
    }
  }

  return {
    feeAdm,
    feeAdmValue,
    debitPriceAdm,
    feeFranchise,
    feeFranchiseValue,
    debitPriceFranchise,
  };
};

module.exports = fee;
