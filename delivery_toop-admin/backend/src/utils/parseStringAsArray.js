module.exports = function parseStringAsArray(arrayAsString) {
  return arrayAsString.split(",").map(company => company.trim());
};
