/** Service */
const { geoCode, geoCodePlaceId } = require("../../../services/maps/geoCode");
const LogModel = require("../../../models/LogModel");

const geoCodeController = async (request, reply) => {
  try {
    const { latitude = null, longitude = null, placeId = null } = request.body || {};

    if (!placeId && (!latitude || !longitude)) {
      return reply.status(400).send({
        message: "Insira os dados corretamente",
      });
    }

    let geoResponse = null;

    if (latitude && longitude) {
      geoResponse = await geoCode(latitude, longitude);
    } else if (placeId) {
      geoResponse = await geoCodePlaceId(placeId);
    }

    if (!geoResponse || !geoResponse.address) {
      return reply.status(400).send({
        message: "Não foi possível verificar o endereço atual",
      });
    }

    geoResponse.shortAddress = geoResponse.street !== "-" ? geoResponse.street : geoResponse.address;

    if (latitude && longitude) {
      geoResponse.latitude = latitude;
      geoResponse.longitude = longitude;
    }

    return reply.send(geoResponse);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/maps/GeoCodeController.js",
      error: err?.message,
      method: "geoCodeController",
      type: "error",
      level: 0,
      origin: "backend",
      request: {
        application: request?.application,
        franchise: request?.franchise,
        company: request?.company,
        params: request?.params,
        body: request?.body,
        query: request?.query,
        heders: request?.heders,
        method: request?.method,
        url: request?.url,
      },
    });

    return reply.status(400).send({
      message: "não foi possível obter as coordenadas",
      err: err.message,
    });
  }
};

module.exports = geoCodeController;
