import { Router } from "express";
import aclController from "../controllers/acl.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Roles (mount at /acl/roles)
router.get("/roles/paginator", authenticate, aclController.paginatorRoles);
router.get("/roles/listPorNome", authenticate, aclController.listRolesPorNome);
router.get("/roles", authenticate, aclController.listRoles);
router.post("/roles", authenticate, aclController.createRole);
router.put("/roles/:id", authenticate, aclController.updateRole);
router.delete("/roles/:id", authenticate, aclController.deleteRole);

// Permissions (mount at /acl/permissions)
router.get("/permissions/paginator", authenticate, aclController.paginatorPermissions);
router.get("/permissions", authenticate, aclController.listPermissions);
router.post("/permissions", authenticate, aclController.createPermission);
router.put("/permissions/:id", authenticate, aclController.updatePermission);
router.delete("/permissions/:id", authenticate, aclController.deletePermission);

// Users (mount at /acl/users)
router.get("/users", authenticate, aclController.users);

export default router;
