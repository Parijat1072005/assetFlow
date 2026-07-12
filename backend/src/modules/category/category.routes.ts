import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createCategorySchema, updateCategorySchema, idParamSchema } from "./category.schema";
import * as controller from "./category.controller";

const router = Router();
router.use(authenticate);

router.get("/", controller.list);
router.get("/:id", validate(idParamSchema, "params"), controller.getOne);

router.post("/", requireRole("ADMIN"), validate(createCategorySchema), controller.create);
router.patch(
  "/:id",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateCategorySchema),
  controller.update
);
router.delete("/:id", requireRole("ADMIN"), validate(idParamSchema, "params"), controller.remove);

export default router;
