import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as controller from "./dashboard.controller";

const router = Router();
router.use(authenticate);

router.get("/stats", controller.getStats);
router.get("/departments", controller.getDepartmentSummary);

export default router;
