const VoucherController = require('../../../controllers/v2/wallet/Voucher');
const voucherRouter = require("express").Router();

const checkFranchises = require("../../../middleware/checkFranchises");
const auth = require("../../../middleware/token");

voucherRouter.post('/', auth, checkFranchises, VoucherController.method.create);
voucherRouter.get('/paginator', auth, checkFranchises, VoucherController.method.paginator);
voucherRouter.put('/:id', VoucherController.method.update);
voucherRouter.delete('/:id', VoucherController.method.detele);

module.exports = voucherRouter;
