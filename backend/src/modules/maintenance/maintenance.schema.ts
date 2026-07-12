import { z } from "zod";

export const createMaintenanceSchema = z.object({
  body: z.object({
    assetId: z.string().uuid("Invalid asset ID"),
    issueDescription: z.string().min(10, "Issue description must be at least 10 characters"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    photoUrl: z.string().url().optional(),
  }),
});

export const decideMaintenanceSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    rejectionReason: z.string().optional(),
  }),
});

export const assignTechnicianSchema = z.object({
  body: z.object({
    technicianId: z.string().uuid("Invalid technician ID"),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["IN_PROGRESS", "RESOLVED"]),
    technicianNote: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ID"),
  }),
});
