const DeliveryMan = require("../../models/DeliveryMan/DeliveryManModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { isOnline, onRoute } = req.query;
    //const { company, companies = [] } = req;

    let filter = {};

    if (isOnline) {
      if (isOnline === "true") {
        filter.isOnline = true;
      } else {
        filter.isOnline = false;
      }
    }

    if (onRoute) {
      filter.flag = "ON_ROUTE";
    }

    filter.deletedAt = {
      $exists: false,
    };

    const list = await DeliveryMan.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "person",
          let: { id: "$person" },
          as: "person",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$id"] } },
            },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: "$person", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "orderStatus",
          let: { id: "$_id" },
          as: "orderStatus",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$deliveryMan", "$$id"] },
                status: "DELIVERY_ROUTE",
              },
            },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: "$orderStatus", preserveNullAndEmptyArrays: true } },
    ]);

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/DeliveryMan/ListDeliveryManOrderStatusController.js',
    error: dadosDoErro?.message,
    method: 'ListDeliveryManOrderStatusController',
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
      mesage: "Falha ao encontrar Lista de Entregadores",
      error: dadosDoErro,
    });
  }
};
