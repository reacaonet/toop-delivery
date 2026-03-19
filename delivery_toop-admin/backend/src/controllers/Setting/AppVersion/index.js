const create = require("./CreateController");
const list = require("./ListController");
const check = require("./CheckController");

module.exports = {
  method: {
    create,
    list,
    check,
  },
};
