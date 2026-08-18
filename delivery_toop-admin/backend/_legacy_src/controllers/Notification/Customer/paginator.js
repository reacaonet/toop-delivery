const Notification = require("../../../models/NotificationModel");
const LogModel = require("../../../models/LogModel");
// const mongoose = require('mongoose');

module.exports = async (req, res) => {
  try {
    const { pageIn = 0, pageOut = 20, name } = req.query || {};
    const { isRoot, franchise } = req;

    let filter = {};
    let list;

    if (!isRoot) {
      filter.franchise = franchise;
    }

    if (name && typeof name === "string" && name.trim().length > 0) {
      filter.name = { $regex: ".*" + name.toLowerCase() + ".*", $options: "i" };
    }

    filter.type = "customer";

    list = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(pageIn) * parseInt(pageOut))
      .limit(parseInt(pageOut));

    let numTotal = await Notification.countDocuments(filter);
    return res.json({ list, total: numTotal });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Notification/Customer/paginator.js',
      error: err?.message,
      method: 'paginator',
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
      message: "Falha ao encontrar Paginação",
      err: err.message,
    });
  }
};
