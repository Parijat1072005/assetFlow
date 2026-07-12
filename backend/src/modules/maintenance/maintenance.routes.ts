import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createMaintenanceSchema,
  decideMaintenanceSchema,
  assignTechnicianSchema,
  updateStatusSchema,
  idParamSchema,
} from "./maintenance.schema";
import * as controller from "./maintenance.controller";

const router = Router();
router.use(authenticate);

router.get("/", controller.list);

// Raise request
router.post(
  "/",
  validate(createMaintenanceSchema),
  controller.raiseRequest
);

// Approve/Reject request (Asset Manager / Admin)
router.post(
  "/:id/decide",
  requireRole("ASSET_MANAGER", "ADMIN"),
  validate(idParamSchema, "params"),
  validate(decideMaintenanceSchema),
  controller.decideRequest
);

// Assign technician
router.post(
  "/:id/assign",
  requireRole("ASSET_MANAGER", "ADMIN"),
  validate(idParamSchema, "params"),
  validate(assignTechnicianSchema),
  controller.assignTechnician
);

// Update progress (Technician)
router.post(
  "/:id/progress",
  validate(idParamSchema, "params"),
  validate(updateStatusSchema),
  controller.updateProgress
);

export default router;
