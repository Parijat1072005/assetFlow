import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(100),
  headId: z.string().uuid().optional().nullable(),
  parentDeptId: z.string().uuid().optional().nullable(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  headId: z.string().uuid().optional().nullable(),
  parentDeptId: z.string().uuid().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
