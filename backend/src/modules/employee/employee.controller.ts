import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as employeeService from "./employee.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await employeeService.listEmployees(req.query as any);
  sendSuccess(res, 200, "Employees fetched", result.items, {
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 200, "Employee fetched", await employeeService.getEmployee(req.params.id));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 200, "Employee updated", await employeeService.updateEmployee(req.user!.id, req.params.id, req.body));
});

export const promote = asyncHandler(async (req: Request, res: Response) => {
  const updated = await employeeService.promoteEmployee(req.user!.id, req.params.id, req.body.role);
  sendSuccess(res, 200, "Employee role updated", updated);
});
