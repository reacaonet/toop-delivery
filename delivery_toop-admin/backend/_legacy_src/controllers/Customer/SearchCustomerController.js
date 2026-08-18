const PersonModel = require("../../models/Person/PersonModel");
const FranchiseModel = require("../../models/Franchise/FranchiseModel");
const LogModel = require("../../models/LogModel");

const searchCustomer = async (req, res) => {
  try {
    const { name } = req.query || {};
    const { isRoot, franchise } = req;
    const filter = {};
    let filterLocation = {};

    if (!name || `${name}`.length <= 1) {
      return res.status(400).send({
        message: "Informe um campo para filtrar",
      });
    }

    filterLocation["customer._id"] = {
      $exists: true,
    };

    if (!isRoot) {
      const respFranchise = await FranchiseModel.findOne({
        _id: franchise,
      })
        .populate("SettingCity")
        .select({
          city: 1,
          location: 1,
          SettingCity: 1,
        })
        .lean();

      if (respFranchise && respFranchise.city && respFranchise.city.latitude && respFranchise.city.longitude) {
        filterLocation["customer.deliveryAddress.location"] = {
          $geoWithin: {
            $centerSphere: [[Number(respFranchise.city.longitude), Number(respFranchise.city.latitude)], Number(16 / 3963.2)],
          },
        };
      } else if (respFranchise.location) {
        filterLocation["customer.deliveryAddress.location"] = {
          $geoWithin: {
            $centerSphere: [
              [Number(respFranchise.location.coordinates[0]), Number(respFranchise.location.coordinates[1])],
              Number(process.env.maxMiles / 3963.2),
            ],
          },
        };
      } else {
        filterLocation["customer.deliveryAddress.location"] = {
          $geoWithin: {
            $centerSphere: [[Number(0), Number(0)], Number(500 / 3963.2)],
          },
        };
      }
    }

    filter.status = true;

    filter.$or = [
      {
        name: {
          $regex: ".*" + `${name}`.toLowerCase() + ".*",
          $options: "i",
        },
      },
      {
        email: {
          $regex: ".*" + `${name}`.toLowerCase() + ".*",
          $options: "i",
        },
      },
      {
        $expr: {
          $regexMatch: {
            input: {
              $convert: {
                input: { $toLong: "$phone" },
                to: "string",
              },
            },
            regex: new RegExp(`${name}`.toLowerCase(), "i"),
          },
        },
      },
    ];

    const list = await PersonModel.aggregate([
      {
        $match: filter,
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: {
            $convert: {
              input: {
                $toLong: "$phone",
              },
              to: "string",
            },
          },
        },
      },
      {
        $lookup: {
          from: "customer",
          let: { person: "$_id" },
          as: "customer",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$person", "$$person"] },
              },
            },
            {
              $project: {
                _id: 1,
                deliveryAddress: 1,
              },
            },
            { $limit: 1 },
            {
              $lookup: {
                from: "customer_delivery_address",
                let: { customer: "$_id" },
                as: "deliveryAddress",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$customer", "$$customer"] },
                      main: true,
                      isDeleted: false,
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      location: 1,
                    },
                  },
                  { $limit: 1 },
                ],
              },
            },
            {
              $unwind: { path: "$deliveryAddress", preserveNullAndEmptyArrays: true },
            },
          ],
        },
      },
      {
        $unwind: { path: "$customer", preserveNullAndEmptyArrays: true },
      },
      {
        $match: filterLocation,
      },
      {
        $limit: 10,
      },
    ]);

    return res.status(200).send(list);
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Customer/SearchCustomerController.js',
    error: err?.message,
    method: 'searchCustomer',
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

module.exports = searchCustomer;
