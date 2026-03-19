const LogModel = require("../../../../models/LogModel");

const getFingerprint = async (req) => {
  try {
    const browserfingerprint = req.fingerPrinter;
    fingerprint = browserfingerprint.fingerprint(req).fingerprint;
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Payment/util/fingerprint.js',
      error: err?.message,
      method: 'getFingerprint',
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

    return '';
  }
};

module.exports = getFingerprint;
