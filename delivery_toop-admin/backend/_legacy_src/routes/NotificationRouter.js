const router = require("express").Router();
const notificationController = require("../controllers/Notification");
const checkFranchises = require("../middleware/checkFranchises");

/** Controllers */
const SendNotification = require("../controllers/Notification/Customer/sendNotification");
const PaginatorNotificaton = require("../controllers/Notification/Customer/paginator");

/** Customer */
router.post("/customer", checkFranchises, SendNotification);
router.get("/customer", checkFranchises, PaginatorNotificaton);

router.get("/paginator", checkFranchises, notificationController.method.paginator);
router.get("/list", checkFranchises, notificationController.method.list);
router.post("/create", notificationController.method.create);
router.post("/register", notificationController.method.register);
router.put("/update/:id", notificationController.method.update);
router.delete("/delete/:id", notificationController.method.remove);

module.exports = router;
