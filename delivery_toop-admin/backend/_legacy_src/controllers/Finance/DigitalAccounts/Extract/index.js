const paginator = require("./PaginatorController");
const balance = require("./ListBalanceController");

module.exports = {
  method: {
    paginator,
    balance,
  },
};
