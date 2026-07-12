import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as categoryService from "./category.service";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, 200, "Categories fetched", await categoryService.listCategories());
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 200, "Category fetched", await categoryService.getCategory(req.params.id));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 201, "Category created", await categoryService.createCategory(req.user!.id, req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 200, "Category updated", await categoryService.updateCategory(req.user!.id, req.params.id, req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.user!.id, req.params.id);
  sendSuccess(res, 200, "Category deleted");
});
