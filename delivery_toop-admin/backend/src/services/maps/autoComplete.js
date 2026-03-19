const axios = require("axios");

const autoComplete = async (address, language = "pt_BR") => {
  let url = "";

  try {
    const apiKey = process.env?.GOOGLE_MAPS ? `${process.env.GOOGLE_MAPS}`.trim() : "";

    if (apiKey === "") {
      throw new Error(`message: Sem token de mapa`);
    }

    url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURI(address)}&language=${language}&key=${apiKey}`;

    const { data: response } = await axios.get(url);

    if (!response || !Array.isArray(response?.predictions)) {
      console.log("fail autocomplete: ", url, response);
      throw new Error("Não foi possível encontrar o endereço");
    }

    const result = response.predictions.map(item => ({ description: item.description, place_id: item.place_id }));

    return result;
  } catch (err) {
    throw new Error(`message: ${err.message} | apiGoogle: ${process.env?.GOOGLE_MAP_KEY} | url: ${url}`);
  }
};

module.exports = autoComplete;
