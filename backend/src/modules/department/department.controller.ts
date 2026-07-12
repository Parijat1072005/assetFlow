import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as departmentService from "./department.service";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const departments = await departmentService.listDepartments();
  sendSuccess(res, 200, "Departments fetched", departments);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const department = await departmentService.getDepartment(req.params.id);
  sendSuccess(res, 200, "Department fetched", department);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const department = await departmentService.createDepartment(req.user!.id, req.body);
  sendSuccess(res, 201, "Department created", department);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const department = await departmentService.updateDepartment(req.user!.id, req.params.id, req.body);
  sendSuccess(res, 200, "Department updated", department);
});

export const deactivate = asyncHandler(async (req: Request, res: Response) => {
  const department = await departmentService.deactivateDepartment(req.user!.id, req.params.id);
  sendSuccess(res, 200, "Department deactivated", department);
});
