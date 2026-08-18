const FranchiseModel = require("../../models/Franchise/FranchiseModel");
const DeliveryManModel = require('../../models/DeliveryMan/DeliveryManModel')
const LogModel = require("../../models/LogModel");
const { getCoordinate } = require('../../utils');

/**
 * Url - /franchises/normalize-delivery-man
 */

const normalizeDeliveryMan = async (req, res) => {
  try {
    let normalize = 0

    const deliveryMan = await DeliveryManModel.find({
      franchise: { $exists: false },
      location: { $exists: true },
      deletedAt: { $exists: false }
    })
      .lean()

    for await (const item of deliveryMan) {
      // deliveryMan.location
      const lat = item.location.coordinates[1]
      const lng = item.location.coordinates[0]

      const franchise = await FranchiseModel.findOne({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(lng), Number(lat)]
            },
            $maxDistance: 20000,
          },
        },
        deletedAt: { $exists: false }
      }).lean();

      if (franchise && franchise._id) {
        // Atualizar
        await DeliveryManModel.updateOne({ _id: item._id }, {
          franchise: franchise._id
        })
        normalize++
      }
    }

    return res.status(200).send({
      total: deliveryMan.length,
      normalize: normalize
    })
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Franchise/normalizeDeliveryMan.js',
      error: err?.message,
      method: 'normalizeDeliveryMan',
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

    console.log('err', err)
    return res.status(400).send({
      message: 'Não foi possível normalizar'
    })
  }
}

module.exports = normalizeDeliveryMan
