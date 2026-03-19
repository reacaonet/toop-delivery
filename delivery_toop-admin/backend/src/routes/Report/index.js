const router = require("express").Router();

const AccessFlowRoute = require("./AccessFlowRouter");

router.use("/access-flow", AccessFlowRoute);

module.exports = router;
