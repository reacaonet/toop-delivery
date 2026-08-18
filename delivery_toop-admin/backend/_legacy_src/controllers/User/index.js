const register = require("./RegisterController");
const list = require("./ListController");
const paginator = require("./PaginatorController");
const create = require("./CreateController");
const update = require("./UpdateController");
const change = require("./ChangeController");
const remove = require("./DeleteController");
const auth = require("./Auth");
const authAdmin = require("./AuthAdmin");
const updateSelectedFranchiseController = require("./UpdateSelectedFranchiseController");
const updateSelectedCompanyController = require("./UpdateSelectedCompanyController");
const updateToken = require("./updateToken");

module.exports = {
  method: {
    auth: auth.auth,
    authadmin: authAdmin.authAdmin,
    refresh: auth.refreshToken,
    register,
    list,
    paginator,
    create,
    update,
    change,
    remove,
    updateSelectedFranchiseController,
    updateSelectedCompanyController,
    updateToken,
  },
};
