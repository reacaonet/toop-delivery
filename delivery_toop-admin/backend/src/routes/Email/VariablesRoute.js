const router = require("express").Router();

const variables = require("../../controllers/Email/Variables");

router.get("/", variables.method.list);

module.exports = router;
