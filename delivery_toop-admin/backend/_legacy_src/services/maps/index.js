const kmDistance = require("../../utils/distanceCoordinate");

const raceTime = (origin, destiny, service = "system") => {
  try {
    if (service === "system") {
      const distance = kmDistance(origin, destiny);
      const minutes = (distance / 40) * 60;

      return Math.round(minutes);
    }

    return 0;
  } catch (err) {
    return false;
  }
};

module.exports = { raceTime };
