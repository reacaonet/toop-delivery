const create = require("./CreateController");
const update = require("./UpdateController");
const remove = require("./DeleteController");
const paginator = require("./PaginatorController");
const list = require("./ListController");

module.exports = {
  method: {
    create,
    list,
    paginator,
    remove,
    update,
  },
};
