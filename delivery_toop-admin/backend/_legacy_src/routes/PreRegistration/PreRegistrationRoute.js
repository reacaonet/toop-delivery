/** Middware */
const auth = require("../../middleware/token");
const checkFranquise = require("../../middleware/checkFranchises");

const preRegistrationRoute = require("express").Router();

/** controllers */
const CreateController = require("../../controllers/PreRegistration/CreateController");
const ListController = require("../../controllers/PreRegistration/ListController");
const UpdateController = require("../../controllers/PreRegistration/UpdateController");
const PaginatorController = require("../../controllers/PreRegistration/PaginatorController");
const DeleteController = require("../../controllers/PreRegistration/DeleteController");

/** Controller Dynamic */
const listViewController = require("../../controllers/PreRegistration/dynamic/ListViewController");
const CreateDynamic = require("../../controllers/PreRegistration/dynamic/CreateDynamicController");
const DynamicRegister = require("../../controllers/PreRegistration/DynamicRegisterController");

preRegistrationRoute.get("/paginator", auth, checkFranquise, PaginatorController);
preRegistrationRoute.get("/dynamic", listViewController);
preRegistrationRoute.get("/:phone", ListController);
preRegistrationRoute.post("/dynamic", CreateDynamic);
preRegistrationRoute.post("/dynamic-record/:id", DynamicRegister);
preRegistrationRoute.post("/", CreateController);
preRegistrationRoute.put("/:id", UpdateController);
preRegistrationRoute.delete("/:id", DeleteController);

module.exports = preRegistrationRoute;
