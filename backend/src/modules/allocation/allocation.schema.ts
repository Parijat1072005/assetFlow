import { z } from "zod";

export const allocateAssetSchema = z.object({
  body: z.object({
    assetId: z.string().uuid("Invalid asset ID"),
    holderType: z.enum(["EMPLOYEE", "DEPARTMENT"]),
    holderEmployeeId: z.string().uuid().optional(),
    holderDepartmentId: z.string().uuid().optional(),
    expectedReturnDate: z.string().datetime().optional(),
  }).refine((data) => {
    if (data.holderType === "EMPLOYEE" && !data.holderEmployeeId) return false;
    if (data.holderType === "DEPARTMENT" && !data.holderDepartmentId) return false;
    return true;
  }, {
    message: "Must provide the corresponding ID for the holder type",
    path: ["holderEmployeeId"],
  }),
});

export const returnAssetSchema = z.object({
  body: z.object({
    checkInCondition: z.enum(["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"]).optional(),
    checkInNotes: z.string().optional(),
  }),
});

export const requestTransferSchema = z.object({
  body: z.object({
    assetId: z.string().uuid("Invalid asset ID"),
    toEmployeeId: z.string().uuid("Invalid target employee ID"),
    reason: z.string().min(5, "Reason must be at least 5 characters"),
  }),
});

export const decideTransferSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    expectedReturnDate: z.string().datetime().optional(), // In case of approval, new expected return
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ID"),
  }),
});
