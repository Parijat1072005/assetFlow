import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as maintenanceService from "./maintenance.service";

export const raiseRequest = asyncHandler(async (req: Request, res: Response) => {
  const { assetId, issueDescription, priority, photoUrl } = req.body;
  const raisedById = (req as any).user.id;

  const request = await maintenanceService.raiseRequest(assetId, raisedById, issueDescription, priority, photoUrl);

  sendSuccess(res, 201, "Maintenance request raised successfully", request);
});

export const decideRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  const decidedById = (req as any).user.id;

  const result = await maintenanceService.decideRequest(id, decidedById, status, rejectionReason);

  sendSuccess(res, 200, `Maintenance request ${status.toLowerCase()} successfully`, result);
});

export const assignTechnician = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { technicianId } = req.body;

  const result = await maintenanceService.assignTechnician(id, technicianId);

  sendSuccess(res, 200, "Technician assigned successfully", result);
});

export const updateProgress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, technicianNote } = req.body;
  const technicianId = (req as any).user.id;

  const result = await maintenanceService.updateProgress(id, technicianId, status, technicianNote);

  sendSuccess(res, 200, "Maintenance progress updated", result);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const requests = await maintenanceService.listRequests(req.query);
  sendSuccess(res, 200, "Maintenance requests retrieved successfully", requests);
});
