import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as auditService from "./audit.service";

export const createAuditCycle = asyncHandler(async (req: Request, res: Response) => {
  const { name, startDate, endDate, auditorIds, departmentId, locationScope } = req.body;
  const createdById = (req as any).user.id;

  const cycle = await auditService.createAuditCycle(
    name, createdById, startDate, endDate, auditorIds, departmentId, locationScope
  );

  sendSuccess(res, 201, "Audit cycle created successfully", cycle);
});

export const verifyItem = asyncHandler(async (req: Request, res: Response) => {
  const { cycleId, itemId } = req.params;
  const { verification, notes } = req.body;
  const verifiedById = (req as any).user.id;

  const item = await auditService.verifyItem(cycleId, itemId, verifiedById, verification, notes);

  sendSuccess(res, 200, "Item verified", item);
});

export const closeAuditCycle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const cycle = await auditService.closeAuditCycle(id, userId);

  sendSuccess(res, 200, "Audit cycle closed successfully", cycle);
});

export const listAuditCycles = asyncHandler(async (req: Request, res: Response) => {
  const cycles = await auditService.listAuditCycles(req.query);
  sendSuccess(res, 200, "Audit cycles retrieved", cycles);
});

export const getAuditItems = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const items = await auditService.getAuditItems(id);
  sendSuccess(res, 200, "Audit items retrieved", items);
});
