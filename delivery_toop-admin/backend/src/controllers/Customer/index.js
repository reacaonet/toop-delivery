const create = require("./CreateController");
const paginator = require("./PaginatorController");
const search = require("./SearchController");
const list = require("./ListController");
const listPorNome = require("./ListPorNomeController");
const update = require("./UpdateController");
const remove = require("./DeleteController");
const searchCustom = require("./SearchCustomerController");

module.exports = {
  method: {
    create,
    paginator,
    list,
    listPorNome,
    update,
    search,
    remove,
    searchCustom,
  },
};
