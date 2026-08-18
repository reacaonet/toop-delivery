const create = require("./CreateController");
const list = require("./ListController");
const paginator = require('./PaginatorController');

module.exports = {
  method: {
    create,
    paginator,
    list,
  },
};
