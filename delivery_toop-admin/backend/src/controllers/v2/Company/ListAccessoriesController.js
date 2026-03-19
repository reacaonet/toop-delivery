const mongoose = require("mongoose");

const Company = require("../../../models/Company/CompanyModel");
const CouponCompany = require("../../../models/Coupon/CouponCompanyModel");
const distanceKM = require("../../../utils/distanceCoordinate");
const LogModel = require("../../../models/LogModel");
const maxMiles = process.env.maxMiles;

module.exports = async (req, res) => {
  try {
    // Opcional, retorna registro único
    const id = req.params.id;
    let {
      name,
      delivery,
      couponCompaniesId,
      couponId,
      category,
      latitude,
      longitude,
      status,
      special,
      favoriteCompanies,
      limit,
      page,
      showAll,
    } = req.query;

    let list = [];
    let filter = {};

    // list = await Company.find();

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Id inválido" });
    }

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      if (special) {
        filter._id = { $eq: mongoose.Types.ObjectId(id) };
      } else {
        list = await getOne(id, delivery, latitude, longitude);
        return res.json(list);
      }
    }

    let companys = await getCouponCompany(couponCompaniesId);

    if (companys) {
      filter._id = {
        $in: favoriteCompanies
          ? [...favoriteCompanies.split(","), ...companys.companys]
          : companys.companys,
      };
    } else if (favoriteCompanies) {
      filter._id = {
        $in: favoriteCompanies.split(","),
      };
    }

    // Filtro de empresas para um cupom específico
    if (couponId) {
      let responseCoupon = await getCompanyCoupon(couponId);
      if (responseCoupon === false) {
        return res.status(200).send([]);
      }

      filter._id = {
        $in: responseCoupon.companies,
      };
    }

    if (category) {
      filter.category = { $eq: category };
    }

    filter.type = { $eq: 'accessories' };

    if (!page) { page = 1 }

    if (name) {
      const decodeName = decodeURIComponent(name);
      filter.name = {
        $regex: '.*' + decodeName.toLowerCase() + '.*', $options: 'i'
      };
    }

    if (`${status}` === 'false' || `${status}` === 'true') {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== "all") {
      filter.status = { $eq: true };
    }

    filter.deletedAt = {
      $exists: false,
    }

    let geoNear = null;
    let filterCount = filter;
    if (latitude && longitude) {
      geoNear = {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)]
          },
          maxDistance: Number(process.env.maxMeters),
          spherical: true,
          distanceField: "distanceUser",
          distanceMultiplier: 0.001 // convert in KM
        }
      };

      filterCount.location = {
        $geoWithin: {
          $centerSphere: [
            [Number(longitude), Number(latitude)],
            Number(maxMiles / 3963.2),
          ]
        }
      };
    }

    let setLimit = parseInt(limit) || 5;
    let numTotal = await Company.find(filterCount).countDocuments();
    let pages = Math.ceil(numTotal / setLimit);

    list = await getDelivery(list, delivery, filter, geoNear, setLimit, page, showAll);

    if (delivery || delivery == "") {
      list = list
        .filter(async (item) => {
          try {
            if (!item.companyDelivery || !item.companyDelivery.max_distance) {
              return false;
            }

            let km = null;
            if (item && item.distanceUser) {
              km = item.distanceUser;
            } else {
              km = distanceKM(
                {
                  latitude: item.location.coordinates[1],
                  longitude: item.location.coordinates[0],
                },
                {
                  latitude: latitude,
                  longitude: longitude,
                }
              );
            }

            const maxDistance = item.companyDelivery.max_distance / 1000;
            if (km > maxDistance) return false;

            return (item.distanceUser = km);
          } catch (err) {
            await LogModel.create({
              path: 'src/controllers/v2/Company/ListAccessoriesController.js',
              error: err?.message,
              method: 'ListAccessoriesController',
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
            return false;
          }
        })
        .map(async (item) => {
          try {
            if (!item.distanceUser || item.distanceUser < 0) return item;
            let distance = item.companyDelivery.distance;
            distance.forEach((element) => {
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
            await LogModel.create({
              path: 'src/controllers/v2/Company/ListAccessoriesController.js',
              error: err?.message,
              method: 'ListAccessoriesController',
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
            return item;
          }
        });
    }

    return res.json({
      list,
      numTotal,
      pages,
    });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/v2/Company/ListAccessoriesController.js',
      error: dadosDoErro?.message,
      method: 'ListAccessoriesController',
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
      message: "Falha ao encontrar Empresa",
      Error: dadosDoErro.message,
    });
  }
};

/**
 * Retorna as Empresas que possui um cupom válido para uso
 */
const getCouponCompany = async (couponCompaniesId) => {
  try {
    let companys = null;
    if (
      couponCompaniesId &&
      mongoose.Types.ObjectId.isValid(couponCompaniesId)
    ) {
      companys = await CouponCompany.findById(couponCompaniesId);
    }

    return companys;
  } catch (err) {
    return null;
  }
};

/**
 * Retonar dados de Entrega
 */
const getDelivery = async (list, delivery, filter, geoNear, setLimit, page, showAll) => {
  try {
    let limit;

    if (showAll) {
      limit = { $limit: 9999999 };
    } else {
      limit = { $limit: page * setLimit };
    }

    if (delivery || delivery == "") {
      let pushAggregate = [];

      if (geoNear) {
        pushAggregate.push(geoNear);
      }

      pushAggregate.push({ $match: filter });
      pushAggregate.push({
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
      });

      pushAggregate.push({ $unwind: "$companyDelivery" });
      pushAggregate.push({ $sort: { "companyDelivery.isOpen": -1 } });
      pushAggregate.push({
        $lookup: {
          from: "group",
          let: { groupId: "$groups" },
          as: "groups",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$groupId"] },
              },
            },
            { $limit: 1 },
          ],
        },
      });

      pushAggregate.push({ $unwind: { path: "$groups", preserveNullAndEmptyArrays: true } });
      pushAggregate.push(limit);
      pushAggregate.push({ $skip: (parseInt(page) - 1) * setLimit });

      list = await Company.aggregate(pushAggregate);

    } else {
      let pushAggregate = [];

      if (geoNear) {
        pushAggregate.push(geoNear);
      }

      pushAggregate.push({ $match: filter });
      pushAggregate.push({
        $lookup: {
          from: "group",
          let: { groupId: "$groups" },
          as: "groups",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$groupId"] },
              },
            },
            { $limit: 1 },
          ],
        },
      });

      pushAggregate.push({ $unwind: { path: "$groups", preserveNullAndEmptyArrays: true } });
      pushAggregate.push(limit);
      pushAggregate.push({ $skip: (parseInt(page) - 1) * setLimit });
      list = await Company.aggregate(pushAggregate);
    }

    return list;
  } catch (err) {
    return list;
  }
};

const getCompanyCoupon = async (coupon) => {
  try {
    return await CouponCompany.findOne({ coupon: coupon })
      .select({ companies: 1, _id: 0 })
      .lean();
  } catch (err) {
    return false;
  }
};

const getOne = async (id, delivery, latitude, longitude) => {
  try {
    if (delivery || delivery == "") {
      let list = await Company.findById(id)
        .populate("groups")
        .populate("companyDelivery").lean();

      if (list && latitude && longitude) {
        let km = distanceKM(
          {
            latitude: list.location.coordinates[1],
            longitude: list.location.coordinates[0],
          },
          {
            latitude: latitude,
            longitude: longitude,
          }
        );

        let distance = list.companyDelivery.distance;
        try {
          distance.forEach((element) => {
            const min = element.min / 1000;
            const max = element.max / 1000;

            if (km >= min && km <= max) {
              list.deliveryPrice = element.price;
              list.deliveryTime = element.delivery_time;
              return list;
            }
          });
        } catch (err) {}
      }

      return list;
    }

    return await Company.findById(id).populate("groups");
  } catch (err) {
    return {};
  }
};
