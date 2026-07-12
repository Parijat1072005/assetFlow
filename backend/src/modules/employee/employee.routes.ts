import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  listEmployeesQuerySchema,
  updateEmployeeSchema,
  promoteEmployeeSchema,
  createEmployeeSchema,
  idParamSchema,
} from "./employee.schema";
import * as controller from "./employee.controller";

const router = Router();
router.use(authenticate);

// Any authenticated user can browse the directory (needed for allocation/transfer pickers).
router.get("/", validate(listEmployeesQuerySchema, "query"), controller.list);
router.get("/:id", validate(idParamSchema, "params"), controller.getOne);

// Only Admin manages the directory (Screen 3, Tab C).
router.post(
  "/",
  requireRole("ADMIN"),
  validate(createEmployeeSchema),
  controller.create
);

router.patch(
  "/:id",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateEmployeeSchema),
  controller.update
);

// The sole role-assignment endpoint in the system.
router.patch(
  "/:id/promote",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(promoteEmployeeSchema),
  controller.promote
);

export default router;
