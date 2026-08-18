const create = require("./CreateController");
const list = require("./ListController");
const remove = require("./DeleteController");

module.exports = {
  method: {
    create,
    list,
    remove,
  },
};
