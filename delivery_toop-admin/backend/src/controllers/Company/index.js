const create = require("./CreateController");
const list = require("./ListController");
const listFavoriteCompanies = require("./ListFavoriteCompanies");
const paginator = require("./PaginatorController");
const register = require("./RegisterController");
const remove = require("./DeleteController");
const search = require("./SearchController");
const update = require("./UpdateController");
const listAll = require("./ListAllController");
const hoursCreate = require("./HoursCreate");
const hoursShow = require("./HoursShow");
const hoursDelete = require("./HoursDelete");
const hoursUpdate = require("./HoursUpdate");
const graphList = require("./graphList");
const listHighlighted = require("./ListHighlightedController");

module.exports = {
  method: {
    create,
    list,
    paginator,
    register,
    remove,
    search,
    update,
    listAll,
    hoursCreate,
    hoursShow,
    hoursDelete,
    hoursUpdate,
    listFavoriteCompanies,
    graphList,
    listHighlighted,
  },
};
