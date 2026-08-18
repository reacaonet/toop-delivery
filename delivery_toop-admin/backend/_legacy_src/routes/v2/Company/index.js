const router = require("express").Router();

/** middleware */
const s3Spaces = require("../../../middleware/spacesS3");

const GetCompaniesLocation = require('../../../controllers/v2/Company/ListLocation');
const GetCompaniesAccessories = require('../../../controllers/v2/Company/ListAccessoriesController');
const registerCompany = require('../../../controllers/v2/Company/Public/registerCompany')

router.get('/accessories', GetCompaniesAccessories);
router.get('/location', GetCompaniesLocation);

// Registro Publico
router.post('/register-company', s3Spaces, registerCompany)

module.exports = router;
