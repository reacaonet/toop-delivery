const axios = require("axios");

const geoCode = async (latitude, longitude) => {
  try {
    if (!latitude || !longitude) {
      throw new Error("Informe as coordenadas corretamente");
    }

    const apiKey = process.env.GOOGLE_MAPS;
    const region = "br";
    const county = "BR";
    let url = "https://maps.googleapis.com/maps/api/geocode/json?";

    url += `latlng=${latitude},${longitude}&language=pt-BR&region=${region}&key=${apiKey}`;
    // console.log('geocoe', url);

    const { data: response } = await axios.get(url);

    if (!response || !response.results || response.results.length <= 0) {
      throw new Error("Não foi possível encontrar o endereço");
    }

    const item = response.results[0];

    return getInfo(item);
  } catch (err) {
    throw new Error(err.message);
  }
};

const geoCodePlaceId = async placeId => {
  try {
    if (!placeId) {
      throw new Error("Informe o placeId corretamente");
    }

    const apiKey = process.env.GOOGLE_MAPS;
    let url = "https://maps.googleapis.com/maps/api/geocode/json?";

    url += `place_id=${placeId}&language=pt-BR&key=${apiKey}`;

    const { data: response } = await axios.get(url);

    if (!response || !response.results || response.results.length <= 0) {
      throw new Error("Não foi possível encontrar o endereço");
    }

    const item = response.results[0];

    return getInfo(item);
  } catch (err) {
    throw new Error(err.message);
  }
};

const getInfo = item => {
  const formattedAddress = item.formatted_address;
  let city = null;
  let country = "BR";
  let district = "-";
  let state = "-";
  let street = "-";
  let streetNumber = "0";
  let zipcode = "-";

  const latitude = item?.geometry?.location?.lat;
  const longitude = item?.geometry?.location?.lng;
  const geometry = item?.geometry;

  for (const component of item.address_components) {
    // City
    const indexCity = component.types.findIndex(element => element === "administrative_area_level_2");

    if (indexCity > -1) {
      city = `${component.long_name}`;
    }

    // pais
    const indexCountry = component.types.findIndex(element => element === "country");

    if (indexCountry > -1) {
      country = `${component.short_name}`;
    }

    // District
    const indexDistrict = component.types.findIndex(element => element === "sublocality_level_1");

    if (indexDistrict > -1) {
      district = `${component.long_name}`;
    }

    // State
    const indexState = component.types.findIndex(element => element === "administrative_area_level_1");

    if (indexState > -1) {
      state = `${component.short_name}`;
    }

    // street
    const indexStreet = component.types.findIndex(element => element === "route");

    if (indexStreet > -1) {
      street = `${component.short_name}`;
    }

    // Street Number
    const indexStreetNumber = component.types.findIndex(element => element === "street_number");

    if (indexStreetNumber > -1) {
      streetNumber = `${component.short_name}`;
    }

    // ZipCode
    const indexZipCode = component.types.findIndex(element => element === "postal_code");

    if (indexZipCode > -1) {
      zipcode = `${component.short_name}`;
    }
  }

  zipcode = zipcode.padEnd(8, "0");

  return {
    address: formattedAddress,
    formatted_address: formattedAddress,
    city,
    country,
    district,
    state,
    street,
    streetNumber,
    zipcode,
    latitude,
    longitude,
    geometry: geometry,
  };
};

module.exports = {
  geoCode,
  geoCodePlaceId,
};
