const router = require("express").Router();

const auth = require("../../middleware/token");

/** Routes */
const PermissionsRoute = require("./PermissionsRoute");
const RolesRoute = require("./RolesRoute");
const UsersRoute = require("./UsersRoute");

// Cart
router.use("/permissions", auth, PermissionsRoute);
router.use("/roles", auth, RolesRoute);
router.use("/users", auth, UsersRoute);

module.exports = router;
