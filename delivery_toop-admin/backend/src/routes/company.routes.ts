import { Router } from "express";
import companyController from "../controllers/company.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createCompanySchema,
  updateCompanySchema,
} from "../validators/company";

const router = Router();

router.get("/", authenticate, companyController.list);
router.get("/:id", authenticate, companyController.getById);
router.post(
  "/",
  authenticate,
  validate(createCompanySchema),
  companyController.create
);
router.put(
  "/:id",
  authenticate,
  validate(updateCompanySchema),
  companyController.update
);
router.delete("/:id", authenticate, companyController.delete);

export default router;
