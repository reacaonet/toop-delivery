const database = require("../firebase");
const redisClient = require("../api/redisConnect");
const LogModel = require("../../models/LogModel");

const notifyMonitoring = async (booking, franchise, status, request) => {
  try {
    const params = {
      franchise: `${franchise}`,
      booking: `${booking}`,
      status: `${status}`,
    };

    const activeRoot = await redisClient.exists(`monitoring:root`);

    const activeFranchise = await redisClient.exists(`monitoring:franchise:${franchise}`);

    if (activeRoot) {
      await database.ref().child(`${process.env.FIREBASE_PATH}monitoring/root`).set(params);
    }

    if (activeFranchise) {
      await database.ref().child(`${process.env.FIREBASE_PATH}monitoring/franchise/${franchise}`).set(params);
    }
  } catch (err) {
    await LogModel.create({
      path: "backend/src/services/monitoring/notifyMonitoring.js",
      error: err?.message,
      method: "notifyMonitoring",
      type: "error",
      level: 0,
      origin: "backend",
      request: {
        application: request?.application,
        franchise: request?.franchise,
        params: request?.params,
        body: request?.body,
        query: request?.query,
        heders: request?.heders,
        method: request?.method,
        url: request?.url,
      },
    });
  }
};

module.exports = { notifyMonitoring };
