const router = require("express").Router();

/** Routes */

const TemplateRoute = require("./TemplateRoute");
const TypeRoute = require("./TypesRoute");
const VariablesRoute = require("./VariablesRoute");

router.use("/templates", TemplateRoute);
router.use("/types", TypeRoute);
router.use("/variables", VariablesRoute);

module.exports = router;
