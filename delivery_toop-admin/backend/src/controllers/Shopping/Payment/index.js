// const create = require("./CreateController");
const MakePayment = require("./MakePaymentController");
const list = require("./ListController");
const Cancel = require('./CancelPayment');
const Search = require('./searchController');

module.exports = {
  method: {
    // create,
    create: MakePayment().pay,
    cancel: Cancel.cancelPayment,
    listOne: list.listOne,
    listPayCustomer: list.listPayCustomer,
    listPayCustomerActive: list.listPayCustomerActive,
    search: Search,
  },
};
