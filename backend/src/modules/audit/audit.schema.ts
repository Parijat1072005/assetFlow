import { z } from "zod";

export const createAuditCycleSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    departmentId: z.string().uuid().optional(),
    locationScope: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    auditorIds: z.array(z.string().uuid()).min(1, "At least one auditor must be assigned"),
  }),
});

export const verifyItemSchema = z.object({
  body: z.object({
    verification: z.enum(["VERIFIED", "MISSING", "DAMAGED"]),
    notes: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ID"),
  }),
});

export const itemParamSchema = z.object({
  params: z.object({
    cycleId: z.string().uuid(),
    itemId: z.string().uuid(),
  }),
});
