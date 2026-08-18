const create = require("./CreateController");
const update = require("./UpdateController");
const list = require("./ListController");
const paginator = require("./PaginatorController");
const search = require("./SearchController");
const remove = require("./DeleteController");
const display = require("./DisplayController");
const highCupon = require("./HighCuponController");
const companyCoupons = require("./CompanyCouponsController");
const companyCouponsAvailable = require("./CouponsCompanyAvailable");
const couponCustomer = require("./CouponCustomerController");
const couponCustomerPaginator = require("./CouponCustomerPaginatorController");

module.exports = {
  method: {
    create,
    list,
    paginator,
    search,
    update,
    remove,
    display,
    highCupon,
    companyCoupons,
    companyCouponsAvailable,
    couponCustomer,
    couponCustomerPaginator,
  },
};
