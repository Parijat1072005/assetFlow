import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createDepartmentSchema, updateDepartmentSchema, idParamSchema } from "./department.schema";
import * as controller from "./department.controller";

const router = Router();

router.use(authenticate);

router.get("/", controller.list);
router.get("/:id", validate(idParamSchema, "params"), controller.getOne);

// Only Admins maintain organization master data (per problem statement, Screen 3 is Admin-only).
router.post("/", requireRole("ADMIN"), validate(createDepartmentSchema), controller.create);
router.patch(
  "/:id",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateDepartmentSchema),
  controller.update
);
router.patch(
  "/:id/deactivate",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  controller.deactivate
);

export default router;
