import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as allocationService from "./allocation.service";

export const allocate = asyncHandler(async (req: Request, res: Response) => {
  const { assetId, holderType, holderEmployeeId, holderDepartmentId, expectedReturnDate } = req.body;
  const createdById = (req as any).user.id;

  const allocation = await allocationService.allocateAsset(
    assetId,
    holderType,
    createdById,
    holderEmployeeId,
    holderDepartmentId,
    expectedReturnDate
  );

  sendSuccess(res, 201, "Asset allocated successfully", allocation);
});

export const returnAsset = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { checkInCondition, checkInNotes } = req.body;
  const userId = (req as any).user.id;

  const allocation = await allocationService.returnAsset(id, userId, checkInCondition, checkInNotes);

  sendSuccess(res, 200, "Asset returned successfully", allocation);
});

export const requestTransfer = asyncHandler(async (req: Request, res: Response) => {
  const { assetId, toEmployeeId, reason } = req.body;
  const fromEmployeeId = (req as any).user.id;

  const request = await allocationService.requestTransfer(assetId, fromEmployeeId, toEmployeeId, reason);

  sendSuccess(res, 201, "Transfer requested successfully", request);
});

export const decideTransfer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, expectedReturnDate } = req.body;
  const decidedById = (req as any).user.id;

  const result = await allocationService.decideTransfer(id, decidedById, status, expectedReturnDate);

  sendSuccess(res, 200, `Transfer ${status.toLowerCase()} successfully`, result);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const allocations = await allocationService.listAllocations(req.query);
  sendSuccess(res, 200, "Allocations retrieved successfully", allocations);
});
