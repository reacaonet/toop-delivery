const router = require("express").Router();

/** Validators */
const CreateValidate = require("../../../validator/mobility/message/create.validate");

/** controllers */
const Create = require("../../../controllers/Mobility/chatMessage/createController");
const List = require("../../../controllers/Mobility/chatMessage/listController");
const Conversations = require("../../../controllers/Mobility/chatMessage/ConversationsController");

router.get("/", List);
router.get("/conversations", Conversations);
router.get('/notified-booking/:booking',);
router.post("/", CreateValidate, Create);

module.exports = router;
