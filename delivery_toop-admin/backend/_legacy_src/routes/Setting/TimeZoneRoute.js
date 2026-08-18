const router = require("express").Router();

const List = require("../../controllers/Setting/timeZone/ListController");

router.get("/", List);

module.exports = router;
