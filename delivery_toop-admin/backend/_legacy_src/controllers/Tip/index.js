const create = require("./CreateController");
const list = require("./ListController");
const remove = require("./DeleteController");
const search = require("./SearchController");

module.exports = {
  method: {
    create,
    list,
    remove,
    search,
  },
};
