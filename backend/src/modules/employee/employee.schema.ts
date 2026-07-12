import { z } from "zod";

export const listEmployeesQuerySchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  role: z.enum(["EMPLOYEE", "DEPARTMENT_HEAD", "ASSET_MANAGER", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  departmentId: z.string().uuid().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  phone: z.string().max(20).optional().nullable(),
});

// The ONLY place a role changes hands. Deliberately separate from the
// general update endpoint so it can carry its own RBAC + audit trail.
export const promoteEmployeeSchema = z.object({
  role: z.enum(["EMPLOYEE", "DEPARTMENT_HEAD", "ASSET_MANAGER", "ADMIN"]),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
