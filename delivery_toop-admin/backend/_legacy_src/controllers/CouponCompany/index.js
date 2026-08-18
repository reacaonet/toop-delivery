const create = require("./CreateController");
const update = require("./UpdateController");
const list = require("./ListController");
const remove = require("./DeleteController");
const company = require("./CompanyController");
const searchCoupon = require("./SearchCompanyController");

module.exports = {
  method: {
    create,
    list,
    update,
    remove,
    company,
    searchCoupon,
  },
};
