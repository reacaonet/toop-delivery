const register = require("./RegisterController");
const create = require("./CreateController");
const list = require("./ListController");
const listByName = require('./ListByNameController');
const paginator = require('./PaginatorController');
const update = require("./UpdateController");
const updateImage = require("./UpdateImageController");
const remove = require("./DeleteController");
const filterCompany = require("./CompanyController");
const companyOffer = require("./CompanyOfferController");
const department = require("./DepartmentController");
const search = require("./SearchController");
const barCode = require("./barCode");
const related = require('./RelatedProductsController');
const link = require('./LinkController');

module.exports = {
  method: {
    companyOffer,
    filterCompany,
    register,
    create,
    list,
    listByName,
    paginator,
    update,
    updateImage,
    remove,
    barCode: barCode.barCode,
    department,
    search,
    related,
    link
  },
};
