const LogModel = require("../../../../models/LogModel");

const logPayment = (payload, originError, typeLog = "ERROR", isError = true) => {
  try {
    let descripPayload = {};

    if (isError) {
      descripPayload = {
        message: payload.message,
        err: payload,
      }
    } else {
      descripPayload = payload
    }

    Log.create({
      typeSystem: "BACKEND",
      typeLog: typeLog,
      description: descripPayload,
      category: "payment",
      originError: originError,
    });
  } catch (err) {
    console.log("Opps fail create log", err);
  }
};

module.exports = logPayment;
