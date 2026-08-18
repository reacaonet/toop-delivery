/* Services */
const { directions, directionsTool } = require("./directions");

const getDuratinAndDistance = async (origin, destiny, additionalStops) => {
  try {
    const coordOrigin = `${origin.latitude},${origin.longitude}`;
    const coordDestiny = `${destiny.latitude},${destiny.longitude}`;
    let waypoints = null;

    if (additionalStops && `${additionalStops}`.length > 5) {
      waypoints = `${additionalStops}`.replace(/\|$/, "");
    }

    const response = await directions(coordOrigin, coordDestiny, waypoints);

    if (!response || response.status !== 200 || !response.data) {
      return null;
    }

    const { distance, duration, overviewPolyline } = response;

    return {
      distance,
      duration,
      overviewPolyline,
    };
  } catch (err) {
    return null;
  }
};

module.exports = { getDuratinAndDistance };
