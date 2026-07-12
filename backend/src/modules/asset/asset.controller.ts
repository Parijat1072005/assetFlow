import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as assetService from "./asset.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await assetService.listAssets(req.query as any);
  sendSuccess(res, 200, "Assets fetched", result.items, {
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 200, "Asset fetched", await assetService.getAsset(req.params.id));
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 200, "Asset history fetched", await assetService.getAssetHistory(req.params.id));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 201, "Asset registered", await assetService.createAsset(req.user!.id, req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 200, "Asset updated", await assetService.updateAsset(req.user!.id, req.params.id, req.body));
});

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, reason } = req.body;
  sendSuccess(res, 200, "Asset status updated", await assetService.changeAssetStatus(req.user!.id, req.params.id, status, reason));
});
