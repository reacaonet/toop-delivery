const create = require("./CreateController");
const paginator = require('./PaginatorController');
const list = require("./ListController");
const update = require("./UpdateController");

module.exports = {
  method: {
    create,
    paginator,
    list,
    update
  },
};
