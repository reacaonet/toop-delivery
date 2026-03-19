const router = require("express").Router();

/** controllers */
const TopicController = require('../../../controllers/Mobility/Topic');

router.get("/link-user-topics", TopicController.method.link);
router.post("/", TopicController.method.create);
router.post("/send", TopicController.method.send);

module.exports = router;
