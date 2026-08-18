const create = require("./CreateController");
const list = require("./ListController");
const paginator = require("./PaginatorController");
const update = require("./UpdateController");
const remove = require("./DeleteController");
const updateViews = require("./UpdateViewsController");
const listPopupApp = require("./ListPopupAppController");

module.exports = {
  method: {
    list,
    create,
    paginator,
    update,
    remove,
    updateViews,
    listPopupApp,
  },
};
