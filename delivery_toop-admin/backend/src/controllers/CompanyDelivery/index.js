const create = require("./CreateController");
const list = require("./ListController");
const paginator = require("./PaginatorController");
const update = require("./UpdateController");
const updateCompanyId = require("./UpdateCompanyIdController");
const openCompanyUpdate = require("./OpenCompanyUpdateController");
const remove = require("./DeleteController");

module.exports = {
  method: {
    create,
    list,
    paginator,
    update,
    openCompanyUpdate,
    remove,
    updateCompanyId,
  },
};
