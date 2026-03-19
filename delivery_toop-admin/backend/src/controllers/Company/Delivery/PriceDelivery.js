const mongoose = require("mongoose");

/** Model */
const CompanyDelivery = require("../../../models/Company/CompanyDeliveryModel");
const LogModel = require("../../../models/LogModel");
/** Service */
const distanceKM = require("../../../utils/distanceCoordinate");

const priceDelivery = async (req, res) => {
  try {
    const { company } = req.params;
    const { latitude, longitude } = req.query;

    let price = 0;

    if (!company || !mongoose.Types.ObjectId(company)) {
      return res.status(400).send({
        message: "Informe uma empresa",
      });
    }

    if (!latitude || !longitude) {
      return res.status(400).send({
        message: "Informe a coordenada",
      });
    }

    const companyDelivery = await CompanyDelivery.findOne({
      company: company,
      deletedAt: {
        $exists: false,
      },
    })
      .populate("company")
      .lean();

    if (!companyDelivery || !companyDelivery.company) {
      return res.status(400).send({
        message: "Verifique se empresa tem dados de Delivery ativo e ou preenchido",
      });
    }

    let latitudeCompany = companyDelivery.company.location.coordinates[1];
    let longitudeCompany = companyDelivery.company.location.coordinates[0];

    const distanceUser = distanceKM(
      {
        latitude: latitude,
        longitude: longitude,
      },
      {
        latitude: latitudeCompany,
        longitude: longitudeCompany,
      },
    );

    let distances = companyDelivery.distance;

    distances.forEach(element => {
      const min = element.min / 1000;
      const max = element.max / 1000;
      if (distanceUser >= min && distanceUser <= max) {
        console.log("teste", price);
        price = element.price;
        return;
      }
    });

    if (!price || price <= 0) {
      if (distances && Array.isArray(distances) && distances.length > 0) {
        let lastIndex = distances.length - 1;
        const item = distances[lastIndex];
        if (item.price) {
          price = item.price;
        }
      }
    }

    return res.send({
      price: price,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Company/Delivery/PriceDelivery.js',
      error: err?.message,
      method: 'priceDelivery',
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
      message: "Não conseguimos processar",
      err: err.message,
    });
  }
};

module.exports = priceDelivery;
