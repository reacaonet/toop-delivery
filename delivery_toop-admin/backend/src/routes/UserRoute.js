const router = require("express").Router();
const userController = require("../controllers/User");
const auth = require("../middleware/token");
const checkFranchises = require("../middleware/checkFranchises");

/** Validate */
const CreateResetValidate = require("../validator/user/createResetCode.validate");
const ResetCodeValidate = require("../validator/user/resetCode.validate");

/** Controllers */
const CreateCodeReset = require("../controllers/User/ResetPassword/CreateCodeController");
const ResetPassword = require("../controllers/User/ResetPassword/ResetPasswordController");

// router.get('/', checkToken, userController.method.list);
router.get("/paginator", auth, checkFranchises, userController.method.paginator);
router.get("/:id?", auth, checkFranchises, userController.method.list);
router.post("/", auth, checkFranchises, userController.method.create);
router.post("/auth", userController.method.auth);
router.post("/auth-admin", userController.method.authadmin);
router.post("/refresh", userController.method.refresh);
router.post("/reset/password", CreateResetValidate, CreateCodeReset);
router.put("/reset/password", ResetCodeValidate, ResetPassword);
router.put("/:user_id/change", auth, userController.method.change);
router.put("/:id/update-selected-franchise", auth, userController.method.updateSelectedFranchiseController);
router.put("/:id/update-selected-company", auth, userController.method.updateSelectedCompanyController);
router.put("/:id", auth, userController.method.update);
router.delete("/:id", auth, userController.method.remove);
router.put("/push-token/:id", userController.method.updateToken);

module.exports = router;
