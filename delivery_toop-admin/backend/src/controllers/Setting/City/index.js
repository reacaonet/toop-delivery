const create = require("./CreateController");
const list = require("./ListController");
const update = require("./UpdateController");
const paginator = require("./PaginatorController");
const remove = require("./DeleteController");
const normalizeCities = require("./normalizeCities");

module.exports = {
  method: {
    create,
    list,
    update,
    paginator,
    remove,
    normalizeCities,
  },
};
