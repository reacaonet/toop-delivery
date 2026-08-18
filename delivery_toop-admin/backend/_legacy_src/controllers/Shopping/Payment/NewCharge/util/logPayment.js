const LogModel = require("../../../../../models/LogModel");

const logPayment = (err, originError) => {
  try {
    Log.create({
      typeSystem: "BACKEND",
      typeLog: "ERROR",
      description: err,
      category: "payment-new-change",
      originError: originError,
    });
  } catch (err) {
    console.log("Opps fail create log", err);
  }
};

module.exports = logPayment;
