import { Router } from "express";
import { Request, Response } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as service from "./notification.service";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const unreadOnly = req.query.unreadOnly === "true";
    sendSuccess(res, 200, "Notifications fetched", await service.listNotifications(req.user!.id, unreadOnly));
  })
);

router.patch(
  "/:id/read",
  asyncHandler(async (req: Request, res: Response) => {
    await service.markNotificationRead(req.user!.id, req.params.id);
    sendSuccess(res, 200, "Notification marked as read");
  })
);

router.patch(
  "/read-all",
  asyncHandler(async (req: Request, res: Response) => {
    await service.markAllNotificationsRead(req.user!.id);
    sendSuccess(res, 200, "All notifications marked as read");
  })
);

// Full org-wide activity log — restricted to Admins / Asset Managers.
router.get(
  "/activity-log",
  requireRole("ADMIN", "ASSET_MANAGER"),
  asyncHandler(async (req: Request, res: Response) => {
    const { entityType, entityId, actorId } = req.query as Record<string, string | undefined>;
    sendSuccess(res, 200, "Activity log fetched", await service.listActivityLog({ entityType, entityId, actorId }));
  })
);

export default router;
