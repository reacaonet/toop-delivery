const router = require("express").Router();
const multipart = require("connect-multiparty");

const s3Spaces = require("../middleware/spacesS3");
const checkFranchises = require("../middleware/checkFranchises");
const groupController = require("../controllers/Group");

router.get("/paginator", checkFranchises, groupController.method.paginator);
router.get("/list", checkFranchises, groupController.method.list);
//router.post('/create', groupController.method.create);
router.post("/register", groupController.method.register);
//router.put('/update/:id', groupController.method.update);
router.delete("/delete/:id", groupController.method.remove);
router.get("/list/:nome", checkFranchises, groupController.method.listPorNome);
// const multipartMiddleware = multipart({ uploadDir: './../frontend/src/assets/uploads' });

router.post("/create", s3Spaces, groupController.method.create);
router.put("/update/:id", s3Spaces, groupController.method.update);

module.exports = router;
