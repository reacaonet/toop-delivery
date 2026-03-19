const router = require("express").Router();
/** Validators */
//const CreateNotifiValidate = require ('../../../validator/mobility/pushNotification/createNotification');

/** controllers */
const pushNotificationController = require ('../../../controllers/Mobility/PushNotification');
router.get("/paginator", pushNotificationController.method.paginator);
router.post("/", pushNotificationController.method.create);

module.exports = router;
