const create = require("./CreateController");
const update = require("./UpdateController");
const remove = require("./DeleteController");

const paginator = require("./PaginatorController");

const list = require("./ListController");
const listAll = require("./ListAllController");
const search = require("./SearchController");
const linkToFranchise = require("./linkToFranchise");
const graphList = require("./graphList");

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
    linkToFranchise,
  },
};
