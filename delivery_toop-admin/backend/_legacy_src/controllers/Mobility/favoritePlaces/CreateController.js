/** Model */
const FavoritePlacesModel = require("../../../models/Mobility/Passenger/FavoritePlacesModel");

/** Service */
const { geoCode } = require("../../../services/maps/geoCode");

const createController = async (request, reply) => {
  try {
    const { passenger, name, latitude, longitude, shortAddress = null, address = null } = request.body || {};

    let short = shortAddress || "";
    let txtAddress = address || "";

    if (!shortAddress || `${shortAddress}`.length <= 3) {
      const geoResponsegeoCode = await geoCode(latitude, longitude);

      if (!geoResponse || !geoResponse.address) {
        return reply.status(400).send({
          message: "Não foi possível salvar seu endereço",
        });
      }

      txtAddress = geoResponse.address;
      short = geoResponse.street !== "-" ? geoResponse.street : geoResponse.address;
    }

    const location = {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    };

    const response = await FavoritePlacesModel.create({
      passenger,
      name,
      location,
      shortAddress: short,
      address: txtAddress,
    });

    return reply.send(response);
  } catch (errgeoCode) {
    return reply.status(400).send({
      message: "Falha ao salvar local favorito",
      err: err.message,
    });
  }
};

module.exports = createController;
