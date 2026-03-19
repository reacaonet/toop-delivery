const FranchiseModel = require("../../models/Franchise/FranchiseModel");
const DeliveryManModel = require("../../models/DeliveryMan/DeliveryManModel");
const LogModel = require("../../models/LogModel");
const { getCoordinate } = require("../../utils");

/**
 * Url - /franchises/normalize-coordinate
 */
const normalizeCoordinates = async (req, res) => {
  try {
    let normalize = 0;
    let normalizeDelivery = 0;

    const franchises = await FranchiseModel.find({
      deletedAt: { $exists: false },
      location: { $exists: false },
    }).lean();

    for await (const franchise of franchises) {
      if (franchise.city && franchise.state) {
        const respCoord = await getCoordinate(`${franchise.city.name} - ${franchise.state.name}`);
        if (respCoord && respCoord.lat) {
          normalize++;
          await FranchiseModel.updateOne(
            { _id: franchise._id },
            {
              location: {
                type: "Point",
                coordinates: [Number(respCoord.lng), Number(respCoord.lat)],
              },
            },
          );
        }
      }
    }

    // DeliveryMan
    const deliveryMan = await DeliveryManModel.find({
      location: { $exists: false },
      deletedAt: { $exists: false },
    })
      .populate({
        path: "company",
        populate: {
          path: "franchise",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    for await (const item of deliveryMan) {
      if (item.company && item.company.franchise && item.company.franchise.location) {
        normalizeDelivery++;
        await DeliveryManModel.updateOne(
          { _id: item._id },
          {
            location: item.company.franchise.location,
          },
        );
      }
    }

    return res.status(200).send({
      totalNormalize: normalize,
      totalNormalizeDelivery: normalizeDelivery,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Franchise/normalizeCoordinates.js',
      error: err?.message,
      method: 'normalizeCoordinates',
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

    console.log("err", err);
    return res.status(400).send({
      message: "Não foi possível normalizar",
    });
  }
};

module.exports = normalizeCoordinates;
