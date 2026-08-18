const axios = require("axios");

const generateDirectionImage = async (type = "google", overviewPolyline) => {
  try {
    if (type === "google") {
      return generateImageGoogleMaps(overviewPolyline);
    } else if (type === "mapbox") {
      return "";
    }

    return null;
  } catch (err) {
    return null;
  }
};

const generateImageGoogleMaps = async overviewPolyline => {
  try {
    const width = 600;
    const height = 400;
    const key = `${process.env.GOOGLE_MAPS}`.trim();

    const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?size=${width}x${height}&path=weight:3%7Ccolor:blue%7Cenc:${overviewPolyline}&key=${key}`;

    const { data: imageResponse } = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    // Converte o conteúdo da imagem para Base64
    const base64Image = Buffer.from(imageResponse, "binary").toString("base64");

    return base64Image;

    // const image = sendFileBase64(
    //   base64Image,
    //   `maps/booking/${bookingId}`,
    //   imgName,
    // );

    // return image;
  } catch (err) {
    return null;
  }
};

module.exports = generateDirectionImage;
