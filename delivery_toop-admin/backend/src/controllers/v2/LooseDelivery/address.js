const LogModel = require("../../../models/LogModel");

const axios = require("axios");

const getAddress = async (req, res) => {
  try {
    const { address, latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).send({
        message: "Informe as coordenadas",
      });
    }

    const apiKey = process.env.GOOGLE_MAPS;
    const region = "br";
    const county = "BR";
    let list = [];
    let url = "https://maps.googleapis.com/maps/api/geocode/json?";

    if (address && address.search("place_id=") !== -1) {
      url += `&${address}&key=${apiKey}`;
    } else if (address) {
      url += `address=${address}&language=pt-BR&region=${region}&key=${apiKey}`;
    } else {
      url += `latlng=${latitude},${longitude}&language=pt-BR&region=${region}&key=${apiKey}`;
    }

    const { data: response } = await axios.get(url);

    if (!response || !response.results || response.results.length <= 0) {
      return res.status(400).send({
        message: "Não foi possível encontrar o endereço",
      });
    }

    const item = response.results[0];
    let formattedAddress = item.formatted_address;
    let city = null;
    let district = null;
    let state = null;

    for (const component of item.address_components) {
      // City
      let indexCity = component.types.findIndex(element => element === "administrative_area_level_2");

      if (indexCity > -1) {
        city = `${component.long_name}`;
      }

      // District
      let indexDistrict = component.types.findIndex(element => element === "sublocality_level_1");

      if (indexDistrict > -1) {
        district = `${component.long_name}`;
      }

      // State
      let indexState = component.types.findIndex(element => element === "administrative_area_level_1");

      if (indexState > -1) {
        state = `${component.short_name}`;
      }
    }

    return res.status(200).send({
      address: formattedAddress,
      city,
      district,
      state,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/LooseDelivery/address.js',
      error: err?.message,
      method: 'getAddress',
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
      message: "Não foi possível pesquisar endereço",
      err: err.message,
    });
  }
};

module.exports = getAddress;
