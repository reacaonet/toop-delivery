const router = require('express').Router();

/** Routes */
const CartRoute = require('./CartRouter')
const CartItemRoute = require('./CartItemRouter')
const FoodProduct = require('./FoodProduct')
const PaymentMethodRoute = require('./PaymentMethodRouter')
const ScheduleRoute = require('./ScheduleRouter')
const departmentRoute = require('./DepartmentRouter')
const departmentMobileRoute = require('./DepartmentMobileRouter')
const InvoiceRoute = require('./InvoiceRouter')
const OrderRoute = require('./OrderRouter')

// Cart
router.use('/cart', CartRoute);
// Item Cart
router.use('/cart-item', CartItemRoute);
router.use('/food-product', FoodProduct);
//Payment Method
router.use('/payment-method', PaymentMethodRoute);
//Schedule
router.use('/schedule', ScheduleRoute);

router.use('/department', departmentRoute);

router.use('/departmentmobile', departmentMobileRoute)

router.use('/invoice', InvoiceRoute);

router.use('/order', OrderRoute);

module.exports = router;
