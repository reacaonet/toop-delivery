const paginator = require("./PaginatorController");
const list = require("./ListController");
const franchisePaginator = require("./franchise/franchiseController");
const balanceFranchise = require("./franchise/balanceFranchise");
const companyPaginator = require("./company/companyController");
const balanceCompany = require("./company/balanceCompany");
const balanceAdm = require("./adm/balanceAdm");
const admPaginator = require("./adm/admController");
const checkPayment = require("./adm/checkPayment");

module.exports = {
  method: {
    paginator,
    list,
    franchisePaginator,
    balanceFranchise,
    companyPaginator,
    balanceCompany,
    balanceAdm,
    admPaginator,
    checkPayment,
  },
};
