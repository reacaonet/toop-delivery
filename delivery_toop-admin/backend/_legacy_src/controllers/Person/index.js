const list = require("./ListController");
const create = require("./CreateController");
const update = require("./UpdateController");
const remove = require("./DeleteController");
const listPorNome = require('./ListPorNomeController');
const search = require("./SearchController");
const paginator = require("./PaginatorController");
const avatar = require("./GetAvatar");

module.exports = {
  method: {
    list: list.list,
    paginator,
    listPorNome,
    listOne: list.listOne,
    search: search.search,
    create,
    update,
    remove,
    avatar,
  },
};
