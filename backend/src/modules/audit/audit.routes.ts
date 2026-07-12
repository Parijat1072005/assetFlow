import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createAuditCycleSchema,
  verifyItemSchema,
  idParamSchema,
  itemParamSchema,
} from "./audit.schema";
import * as controller from "./audit.controller";

const router = Router();
router.use(authenticate);

router.get("/", controller.listAuditCycles);
router.get("/:id/items", validate(idParamSchema, "params"), controller.getAuditItems);

// Create cycle
router.post(
  "/",
  requireRole("ADMIN", "DEPARTMENT_HEAD", "ASSET_MANAGER"),
  validate(createAuditCycleSchema),
  controller.createAuditCycle
);

// Verify item
router.patch(
  "/:cycleId/items/:itemId",
  validate(itemParamSchema, "params"),
  validate(verifyItemSchema),
  controller.verifyItem
);

// Close cycle
router.post(
  "/:id/close",
  requireRole("ADMIN", "DEPARTMENT_HEAD", "ASSET_MANAGER"),
  validate(idParamSchema, "params"),
  controller.closeAuditCycle
);

export default router;
