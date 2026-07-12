import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createAssetSchema,
  updateAssetSchema,
  changeAssetStatusSchema,
  listAssetsQuerySchema,
  idParamSchema,
} from "./asset.schema";
import * as controller from "./asset.controller";

const router = Router();
router.use(authenticate);

router.get("/", validate(listAssetsQuerySchema, "query"), controller.list);
router.get("/:id", validate(idParamSchema, "params"), controller.getOne);
router.get("/:id/history", validate(idParamSchema, "params"), controller.getHistory);

// Registering and editing assets is an Asset Manager / Admin responsibility.
router.post("/", requireRole("ASSET_MANAGER", "ADMIN"), validate(createAssetSchema), controller.create);
router.patch(
  "/:id",
  requireRole("ASSET_MANAGER", "ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateAssetSchema),
  controller.update
);
router.patch(
  "/:id/status",
  requireRole("ASSET_MANAGER", "ADMIN"),
  validate(idParamSchema, "params"),
  validate(changeAssetStatusSchema),
  controller.changeStatus
);

export default router;
