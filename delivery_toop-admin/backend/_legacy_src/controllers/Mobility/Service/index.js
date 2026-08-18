const create = require("./CreateController");
const update = require("./UpdateController");
const remove = require("./DeleteController");

const paginator = require("./PaginatorController");

const list = require("./ListController");
const listAll = require("./ListAllController");
const search = require("./SearchController");
const graphList = require("./graphList");
const listFront = require("./listFront");

module.exports = {
  method: {
    create,
    list,
    paginator,
    remove,
    search,
    update,
    listAll,
    graphList,
    listFront,
  },
};
