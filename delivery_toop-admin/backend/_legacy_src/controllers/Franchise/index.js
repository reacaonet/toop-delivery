const create = require("./CreateController");
const update = require("./UpdateController");
const remove = require("./DeleteController");

const paginator = require("./PaginatorController");

const list = require("./ListController");
const listAll = require("./ListAllController");
const search = require("./SearchController");
const graphList = require("./graphList");
const configurations = require("./Configurations");
const normalizeCoordinate = require("./normalizeCoordinates");
const normalizeDeliveryMan = require("./normalizeDeliveryMan");
const normalizeCities = require("./normalizeCities");

module.exports = {
  method: {
    create,
    list,
    paginator,
    remove,
    search,
    update,
    listAll,
    graphList,
    configurations,
    normalizeCoordinate,
    normalizeDeliveryMan,
    normalizeCities,
  },
};
