const create = require("./CreateController");
const paginator = require("./PaginatorController");

module.exports = {
  method: {
    create,
    paginator,
  }
};
