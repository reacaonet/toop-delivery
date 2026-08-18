const router = require("express").Router();

const aclController = require("../../controllers/Acl");

router.get("/", aclController.method.users);

module.exports = router;
