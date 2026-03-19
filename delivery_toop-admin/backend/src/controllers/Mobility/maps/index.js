const kmDistance = require("../../../utils/kmDistance");
const LogModel = require("../../../models/LogModel");

module.exports = raceTime = (origin, destiny, service = "system") => {
  try {
    if (service === "system") {
      const distance = kmDistance(origin, destiny);
      const minutes = (distance / 35) * 60;

      return Math.round(minutes);
    }

    return 0;
  } catch (err) {
    return false;
  }
};
