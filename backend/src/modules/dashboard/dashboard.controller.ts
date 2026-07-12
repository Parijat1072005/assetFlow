import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as dashboardService from "./dashboard.service";

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const stats = await dashboardService.getDashboardStats(user);
  sendSuccess(res, 200, "Dashboard stats retrieved", stats);
});

export const getDepartmentSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await dashboardService.getDepartmentSummary();
  sendSuccess(res, 200, "Department summary retrieved", summary);
});
