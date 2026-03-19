const router = require("express").Router();

const s3Spaces = require("../../middleware/spacesS3");
const popupController = require("../../controllers/Tools/Popup");
const checkFranchises = require("../../middleware/checkFranchises");

/**
 * @swagger
 * /tools/popup/paginator:
 *   get:
 *     description: Use to return a popup's pagination
 *     tags: [Popup]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.get("/paginator", checkFranchises, popupController.method.paginator);

/**
 * @swagger
 * /tools/popup:
 *   get:
 *     description: Use to return the entire list of popup's
 *     tags: [Popup]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.get("/", checkFranchises, popupController.method.list);

/**
 * @swagger
 * /tools/popup:
 *   post:
 *     description: Use to return a popup's registration
 *     tags: [Popup]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.post("/", s3Spaces, popupController.method.create);
//router.post('/', popupController.method.create);

/**
 * @swagger
 * /tools/popup/:id:
 *   put:
 *     description: Use to return a popup's update
 *     tags: [Popup]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.put("/:id", s3Spaces, popupController.method.update);
//router.put('/:id', popupController.method.update);

/**
 * @swagger
 * /tools/popup/:id:
 *   delete:
 *     description: Use to return a popup's delete
 *     tags: [Popup]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.delete("/:id", popupController.method.remove);

/**
 * @swagger
 * /tools/popup/updateViews/:id:
 *   put:
 *     description: Use to return the number of views updated from a pop-up
 *     tags: [Popup]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.put("/updateViews/:id", popupController.method.updateViews);

/**
 * @swagger
 * /tools/popup/listPopupApp/:id:
 *   get:
 *     description: Use to return the user's most important pop-up
 *     tags: [Popup]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.get("/listPopupApp/:id", popupController.method.listPopupApp);

module.exports = router;
