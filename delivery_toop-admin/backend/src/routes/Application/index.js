const router = require('express').Router();

/** Routes */

const CategoryRoute = require('./CategoryRoute');

router.use('/category', CategoryRoute);

module.exports = router;
