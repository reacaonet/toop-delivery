const router = require("express").Router();

const checkFranchises = require("../../middleware/checkFranchises");
//middleware check auth
const auth = require("../../middleware/token");

const Template = require("../../controllers/Email/Template");

router.get("/paginator", auth, checkFranchises, Template.method.paginator);

router.get("/", auth, checkFranchises, Template.method.list);
router.delete("/:id", Template.method.remove);
router.post("/", auth, checkFranchises, Template.method.create);
router.put("/:id", Template.method.update);

module.exports = router;
