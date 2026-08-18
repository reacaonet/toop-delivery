const Company = require("../../../models/Company/CompanyModel");
const FoodProduct = require("../../../models/Food/ProductModel");
const LogModel = require("../../../models/LogModel");
const distanceKM = require("../../../utils/distanceCoordinate");
const maxMiles = process.env.maxMiles;

/**
 * GET
 * url: /v1/search/company-products
 * params
 * searchText - required
 * companyType
 */
const list = async (req, res) => {
  try {
    const { companyType, searchText, latitude, longitude } = req.query;

    let response = [];
    const filter = {};
    const filterRestaurant = {};
    const limitCompany = 10;
    const limitProduct = 15;

    filter.status = true;

    if (!searchText) {
      return res.status(400).send({
        message: "Informe o que você procura",
      });
    }

    // if (!companyType) {
    //   return res.status(400).send({
    //     message: 'Informe um tipo da empresa'
    //   });
    // }

    if (latitude && longitude) {
      let geoWithin = {
        $centerSphere: [[Number(longitude), Number(latitude)], Number(maxMiles / 3963.2)],
      };

      filter.location = { $geoWithin: geoWithin };
      filterRestaurant["company.location"] = {
        $geoWithin: geoWithin,
      };
    }

    /** Fluxo de Compra MENU */
    const restaurantMenu = await restaurant(searchText, filterRestaurant);
    const restaurantCompany = await searchCompanyRestaurant(searchText, latitude, longitude);

    /** Fluxo de Compra PRODUCT */
    const marketProduct = await supermarket(filter, searchText, limitCompany, limitProduct);
    const marketCompany = await searchCompanySupermarket(searchText, latitude, longitude);

    response = response.concat(restaurantCompany, marketCompany, restaurantMenu, marketProduct);

    if (response) {
      response = DeliveryFeeDistance(response, latitude, longitude);
    }

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Search/v1/SegmentsController.js',
      error: err?.message,
      method: 'list',
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

    console.log("Opps Error", err);
    return res.status(400).send({
      message: "Fail list",
      err: err.message,
    });
  }
};

const supermarket = async (filter, searchText, limitCompany, limitProduct) => {
  try {
    filter.shoppingFlow = "PRODUCT";

    const response = await Company.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "product",
          let: { id: "$_id" },
          as: "products",
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: { $eq: ["$company", "$$id"] },
                  },
                  {
                    active: true,
                  },
                ],
                $or: [
                  {
                    $text: { $search: searchText },
                  },
                  {
                    name: { $regex: ".*" + `${searchText.toLowerCase()}` + ".*", $options: "i" },
                  },
                  {
                    keywords: { $in: [searchText.toLowerCase()] },
                  },
                ],
              },
            },
            { $limit: limitProduct },
          ],
        },
      },
      {
        $project: {
          type: 1,
          images: 1,
          category: 1,
          name: 1,
          description: 1,
          address: 1,
          phone: 1,
          companyDelivery: 1,
          products: 1,
          location: 1,
          totalProducts: {
            $cond: {
              if: { $isArray: "$products" },
              then: { $size: "$products" },
              else: 0,
            },
          },
        },
      },
      { $match: { totalProducts: { $gt: 0 } } },
      {
        $lookup: {
          from: "company_delivery",
          let: { id: "$companyDelivery" },
          as: "companyDelivery",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
                deletedAt: {
                  $exists: false,
                },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: "$companyDelivery", preserveNullAndEmptyArrays: true } },
      { $limit: 100 },
    ]);

    return response;
  } catch (err) {
    console.log("Hey Error ", err);
    return [];
  }
};

const restaurant = async (searchText, filterRestaurant) => {
  try {
    let response = await FoodProduct.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                {
                  isPaused: { $eq: false },
                },
                {
                  isPaused: { $exists: false },
                },
              ],
            },
          ],
          $or: [
            {
              $text: { $search: searchText },
            },
            {
              name: { $regex: ".*" + `${searchText.toLowerCase()}` + ".*", $options: "i" },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "foodCategory",
          let: { id: "$category" },
          as: "category",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$id"] } },
            },
            { $limit: 1 },
            {
              $project: {
                _id: 1,
                company: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "company",
          let: { companyId: "$category.company" },
          as: "company",
          pipeline: [
            {
              $match: {
                $and: [
                  { status: true },
                  {
                    $expr: { $eq: ["$_id", "$$companyId"] },
                    shoppingFlow: "MENU",
                  },
                ],
              },
            },
            { $limit: 1 },
          ],
        },
      },
      { $match: { "company.status": true } },
      { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "company_delivery",
          let: { deliveryId: "$company.companyDelivery" },
          as: "companyDelivery",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$deliveryId"] },
                deletedAt: {
                  $exists: false,
                },
              },
            },
          ],
        },
      },
      { $unwind: { path: "$companyDelivery", preserveNullAndEmptyArrays: true } },
      { $match: filterRestaurant },
      { $limit: 100 },
    ]);

    let productCompany = [];
    let companyProduct = [];

    if (response && response.length > 0) {
      for (const item of response) {
        let company = item.company;
        let companyDelivery = item.companyDelivery;

        delete item.category;
        delete item.company;
        delete item.companyDelivery;

        if (!productCompany[company._id]) {
          productCompany[company._id] = company;
          productCompany[company._id]["products"] = [];
        }

        productCompany[company._id]["products"].push(item);
        productCompany[company._id]["companyDelivery"] = companyDelivery;
      }

      Object.keys(productCompany).map(index => {
        companyProduct.push(productCompany[index]);
      });
    }

    return companyProduct;
  } catch (err) {
    console.log("Fail restaurant", err);
    return [];
  }
};

const searchCompanySupermarket = async (searchText, latitude, longitude) => {
  try {
    let filter = {};
    filter.shoppingFlow = "PRODUCT";
    filter.status = true;

    if (latitude && longitude) {
      filter.location = {
        $geoWithin: {
          $centerSphere: [[Number(longitude), Number(latitude)], Number(maxMiles / 3963.2)],
        },
      };
    }

    filter.deletedAt = { $exists: false };

    filter.$or = [
      {
        $text: { $search: searchText },
      },
      {
        name: { $regex: ".*" + `${searchText.toLowerCase()}` + ".*", $options: "i" },
      },
      {
        keywords: { $in: [searchText.toLowerCase()] },
      },
    ];

    const response = await Company.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "company_delivery",
          let: { id: "$companyDelivery" },
          as: "companyDelivery",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
                deletedAt: {
                  $exists: false,
                },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: "$companyDelivery", preserveNullAndEmptyArrays: true } },
      { $limit: 100 },
    ]);

    return response;
  } catch (err) {
    console.log("Error", err);
    return [];
  }
};

const searchCompanyRestaurant = async (searchText, latitude, longitude) => {
  try {
    let filter = {};
    filter.shoppingFlow = "MENU";
    filter.status = true;

    if (latitude && longitude) {
      filter.location = {
        $geoWithin: {
          $centerSphere: [[Number(longitude), Number(latitude)], Number(maxMiles / 3963.2)],
        },
      };
    }

    filter.deletedAt = { $exists: false };
    // filter.$and = [{ $or: [{ name: { searchText } }, { keywords: { $in: [searchText] } }] }]

    filter.$or = [
      {
        $text: { $search: searchText },
      },
      {
        name: { $regex: ".*" + `${searchText.toLowerCase()}` + ".*", $options: "i" },
      },
      {
        keywords: { $in: [searchText.toLowerCase()] },
      },
    ];

    const response = await Company.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "company_delivery",
          let: { id: "$companyDelivery" },
          as: "companyDelivery",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
                deletedAt: {
                  $exists: false,
                },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: "$companyDelivery", preserveNullAndEmptyArrays: true } },
      { $limit: 100 },
    ]);

    return response;
  } catch (err) {
    console.log("Fail Error", err);
    return [];
  }
};

const DeliveryFeeDistance = (result, latitude, longitude) => {
  try {
    if (!latitude || !longitude) {
      return result;
    }

    result = result
      .filter(item => {
        try {
          if (!item.companyDelivery || !item.companyDelivery.max_distance) {
            return false;
          }

          const km = distanceKM(
            {
              latitude: item.location.coordinates[1],
              longitude: item.location.coordinates[0],
            },
            {
              latitude: latitude,
              longitude: longitude,
            },
          );

          const maxDistance = item.companyDelivery.max_distance / 1000;

          if (km > maxDistance) return false;

          item.distanceUser = km;
          return item;
        } catch (err) {
          console.log("Fail ", err);
          return false;
        }
      })
      .map(item => {
        try {
          if (!item.distanceUser || item.distanceUser < 0) return item;

          let distance = item.companyDelivery.distance;
          distance.forEach(element => {
            const min = element.min / 1000;
            const max = element.max / 1000;

            if (item.distanceUser >= min && item.distanceUser <= max) {
              item.deliveryPrice = element.price;
              item.deliveryTime = element.delivery_time;
              return item;
            }
          });

          if (!item.deliveryTime && distance.length > 0) {
            let lastIndex = distance.length - 1;
            item.deliveryPrice = distance[lastIndex].price;
            item.deliveryTime = distance[lastIndex].delivery_time;
          }

          return item;
        } catch (err) {
          return item;
        }
      });

    return result;
  } catch (err) {
    return [];
  }
};

module.exports = list;
