const router = require("express").Router();
const Person = require("../../controllers/Person");
const registerDuplicate = require("../../controllers/Duplicate/DuplicateRecords");

const checkFranchises = require("../../middleware/checkFranchises");

// router.get('/', Person.method.list)
// router.post('/shooper/auth', Person.method.authShooper)

/**
 * @swagger
 * /person/paginator:
 *   get:
 *     description: Use to return a person's pagination
 *     tags: [Person]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.get("/paginator", checkFranchises, Person.method.paginator);

/**
 * @swagger
 * /person/listPorNome:
 *   get:
 *     description: Use to search for a person by name
 *     tags: [Person]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.get("/listPorNome", checkFranchises, Person.method.listPorNome);

/**
 * @swagger
 * /person/search:
 *   get:
 *     description: Use to search for a person by phone, email our id
 *     tags: [Person]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.get("/search", checkFranchises, Person.method.search);

/**
 * @swagger
 * /person:
 *   get:
 *     description: Use to return the entire list of Person
 *     tags: [Person]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.get("/", checkFranchises, Person.method.list);

/**
 * @swagger
 * /person/:id:
 *   get:
 *     description: Use to return one Person
 *     tags: [Person]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.get("/register-duplicates", registerDuplicate.method.registerDuplicate);

/**
 * @swagger
 * /person/register-duplicates:
 *   get:
 *     description: Use to return one register duplicates
 *     tags: [Person]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.get("/:id", Person.method.listOne);

/**
 * @swagger
 * /person:
 *   post:
 *     description: Use to return a person's registration
 *     tags: [Person]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.post("/", checkFranchises, Person.method.create);

/**
 * @swagger
 * /person/:id:
 *   put:
 *     description: Use to return a person's update
 *     tags: [Person]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.put("/:id", checkFranchises, Person.method.update);

/**
 * @swagger
 * /person/:id:
 *   delete:
 *     description: Use to return a person's delete
 *     tags: [Person]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *        description: A errorful response
 */
router.delete("/:id", Person.method.remove);

router.get("/avatar/:id", Person.method.avatar);

module.exports = router;
