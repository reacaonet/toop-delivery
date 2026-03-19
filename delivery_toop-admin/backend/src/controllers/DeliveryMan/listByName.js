const PersonModel = require("../../models/Person/PersonModel");
const LogModel = require("../../models/LogModel");

const listByName = async (req, res) => {
  try {
    const { name = null } = req.params;
    const { isRoot, franchises } = req;
    const filter = {};

    if (!isRoot || isRoot !== true) {
      filter.franchise = { $in: [...franchises, null] || [] };
    }

    const decodeName = decodeURIComponent(name);

    filter.name = {
      $regex: ".*" + decodeName.toLowerCase() + ".*",
      $options: "i",
    };

    filter.deletedAt = {
      $exists: false,
    };

    const list = await PersonModel.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "deliveryMan",
          let: { id: "$_id" },
          as: "deliveryMan",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$person", "$$id"] },
                deletedAt: { $exists: false },
              },
            },
          ],
        },
      },
      {
        $unwind: { path: "$deliveryMan", preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          deliveryMan: { $exists: true },
        },
      },
      {
        $project: {
          name: 1,
          deliveryMan: 1,
          cpf: 1,
          phone: 1,
        },
      },
    ]);

    return res.status(200).send(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/listByName.js',
      error: err?.message,
      method: 'listByName',
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
      message: "não foi possível listar",
      err: err.message,
    });
  }
};

module.exports = listByName;
