const create = require("./CreateController");
const update = require("./UpdateController");
const remove = require("./DeleteController");

const list = require("./ListController");
const listAll = require("./ListAllController");

module.exports = {
  method: {
    create,
    list,
    remove,
    update,
    listAll,
  },
};
