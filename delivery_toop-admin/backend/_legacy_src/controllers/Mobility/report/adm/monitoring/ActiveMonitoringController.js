/** Model */
const LogModel = require("../../../../../models/LogModel");

/** Service */
const redisClient = require("../../../../../services/api/redisConnect");

const activeMonitoring = async (request, reply) => {
  try {
    const { isRoot, franchise } = request;
    const { firebase } = request.query;

    let key = null;
    let value = null;

    if (!isRoot) {
      key = `monitoring:franchise:${franchise}`;
      value = `${franchise}`.toString();
    } else {
      key = `monitoring:root`;
      value = `root`.toString();
    }

    await redisClient.set(key, `${value}`, "EX", 600); // 10 min

    const response = {
      key: key,
      value: value,
    };

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: "backend/src/controllers/Mobility/report/adm/monitoring/ActiveMonitoringController.js",
      error: err?.message,
      method: "activeMonitoring",
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

    return reply.status(400).send({
      message: "Falha ao ativar",
      err: err.message,
    });
  }
};

module.exports = activeMonitoring;
