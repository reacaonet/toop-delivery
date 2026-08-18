const walletRouter = require("express").Router();

const VoucherController = require('../../../controllers/v2/wallet/Voucher');
const BalanceController = require('../../../controllers/v2/wallet/Balance');

walletRouter.get('/balance', BalanceController.method.list);
walletRouter.post('/add-balance-voucher', VoucherController.method.validate);

module.exports = walletRouter;
