const router = require("express").Router();

const s3Spaces = require("../../../middleware/spacesS3");
const ListController = require('../../../controllers/v2/EcbrBackImage/ListController');
const GenerateCodeController = require('../../../controllers/v2/EcbrBackImage/GenerateCodeController');
const CreateController = require('../../../controllers/v2/EcbrBackImage/CreateController');
const UpdateProductController = require('../../../controllers/v2/EcbrBackImage/UpdateProduct');
const SyncProducts = require('../../../controllers/v2/EcbrBackImage/SyncController');
const ListByBarcode = require('../../../controllers/v2/EcbrBackImage/ListByBarcode');


router.get('/', ListController);
router.get('/generate/code/ecbr', GenerateCodeController);
router.get('/barcode/:barcode', ListByBarcode);
router.get('/sync', SyncProducts);
router.post('/', s3Spaces, CreateController);
router.put("/update/:id", s3Spaces,  UpdateProductController);

module.exports = router;
