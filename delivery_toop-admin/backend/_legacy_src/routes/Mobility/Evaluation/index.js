const router = require("express").Router();

/** midware */
const auth = require("../../../middleware/token");
const checkFranchises = require("../../../middleware/checkFranchises");

/** Validators */
const createValidate = require("../../../validator/mobility/evaluation/create.validate");

/** controllers */
const Create = require("../../../controllers/Mobility/evaluation/CreateController");
const ListMediaController = require("../../../controllers/Mobility/evaluation/ListMediaController");
const EvaluationPassenger = require("../../../controllers/Mobility/evaluation/EvaluationPassengerController");
const PaginatorEvaluationDriver = require("../../../controllers/Mobility/evaluation/PaginatorEvaluationDriverController");

router.get("/", EvaluationPassenger);
router.get("/:rated", ListMediaController);
router.get("/driver/paginator", auth, checkFranchises, PaginatorEvaluationDriver);
router.post("/", createValidate, Create);

module.exports = router;
