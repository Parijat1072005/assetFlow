import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  allocateAssetSchema,
  returnAssetSchema,
  requestTransferSchema,
  decideTransferSchema,
  idParamSchema,
} from "./allocation.schema";
import * as controller from "./allocation.controller";

const router = Router();
router.use(authenticate);

router.get("/", controller.list);

// Allocation
router.post(
  "/",
  requireRole("ASSET_MANAGER", "ADMIN", "DEPARTMENT_HEAD"),
  validate(allocateAssetSchema),
  controller.allocate
);

// Return Asset
router.post(
  "/:id/return",
  validate(idParamSchema, "params"),
  validate(returnAssetSchema),
  controller.returnAsset
);

// Transfer Request
router.post(
  "/transfer",
  validate(requestTransferSchema),
  controller.requestTransfer
);

// Approve/Reject Transfer
router.post(
  "/transfer/:id/decide",
  requireRole("ASSET_MANAGER", "ADMIN", "DEPARTMENT_HEAD"),
  validate(idParamSchema, "params"),
  validate(decideTransferSchema),
  controller.decideTransfer
);

export default router;
