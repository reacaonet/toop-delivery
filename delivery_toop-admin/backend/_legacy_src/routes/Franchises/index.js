const router = require("express").Router();

const s3Spaces = require("../../middleware/spacesS3");
const checkFranchises = require("../../middleware/checkFranchises");

const franchiseController = require("../../controllers/Franchise");
const currentFranchise = require("../../controllers/Franchise/CurrentFranchise");

router.get("/listAll", franchiseController.method.listAll);
router.get("/graphic", franchiseController.method.graphList);
router.get("/paginator", franchiseController.method.paginator);
router.get("/search", franchiseController.method.search);
router.get("/configurations/:company", franchiseController.method.configurations);
router.get("/normalize-coordinate", franchiseController.method.normalizeCoordinate);
router.get("/normalize-cities", franchiseController.method.normalizeCities);
router.get("/normalize-delivery-man", franchiseController.method.normalizeDeliveryMan);
router.get("/lat/:latitude/lng/:longitude", currentFranchise);

router.get("/list/:id?", checkFranchises, franchiseController.method.list);
router.get("/:id?", franchiseController.method.list);
router.post("/", s3Spaces, franchiseController.method.create);
router.put("/:id", s3Spaces, franchiseController.method.update);
router.delete("/:id", franchiseController.method.remove);

module.exports = router;
