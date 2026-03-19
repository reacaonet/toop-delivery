const Company = require('../../../../models/Company/CompanyModel');
const LogModel = require("../../../../models/LogModel");

const percentMin = 10;
const maxMiles = process.env.maxMiles;

/**
 * GET
 * url: /v1/food/discount-restaurant/
 * params
 * latitude - required
 * longitude - required
*/
const discount = async (req, res) => {
  try {

    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).send({
        message: 'Informe uma coordenada'
      });
    }

    const response = await Company.aggregate([
      {
        $match: {
          status: true,
          type: 'restaurant',
          location: {
            $geoWithin: {
              $centerSphere: [
                [
                  Number(longitude),
                  Number(latitude)
                ],
                Number(maxMiles / 3963.2),
              ]
            }
          },
          deletedAt: { $exists: false }
        },
      },
      {
        $lookup: {
          from: "company_delivery",
          let: { deliveryId: "$companyDelivery" },
          as: "companyDelivery",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$deliveryId"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: "$companyDelivery" },
      {
        $lookup: {
          from: "foodProduct",
          let: { id: "$_id" },
          as: "product",
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: { $eq: ["$company", "$$id"] }
                  },
                  {
                    percentualDiscount: { $gte: percentMin }
                  },
                  {
                    deletedAt: { $exists: false }
                  },
                  {
                    $or: [
                      { isPaused: { $exists: false } },
                      { isPaused: { $ne: true } }
                    ]
                  }
                ],
              },
            },
            { $sort: { percentualDiscount: -1 } },
            { $limit: 1 }
          ],
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          'product.percentualDiscount': {
            $exists: true
          }
        },
      },
      {
        $project: {
          type: 1,
          images: 1,
          name: 1,
          location: 1,
          'product.percentualDiscount': 1,
        }
      },
      {
        $sort: {
          'product.percentualDiscount': -1
        }
      },
      {
        $limit: 20,
      }
    ]);

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v1/Food/Discount/DiscountController.js',
      error: err?.message,
      method: 'discount',
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
      message: 'Não foi possível processar informação',
      err: err.message,
    });
  }
};

module.exports = discount;
