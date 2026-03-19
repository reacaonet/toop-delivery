const LogModel = require("../../../../models/LogModel");

const logPayment = (err, originError) => {
  try {
    Log.create({
      typeSystem: "BACKEND",
      typeLog: "ERROR",
      description: {
        message: err.message,
        err: err,
      },
      category: "payment",
      originError: originError,
    });
  } catch (err) {
    console.log("Opps fail create log", err);
  }
};

module.exports = logPayment;
