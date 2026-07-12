import { z } from "zod";

export const createAssetSchema = z.object({
  name: z.string().min(2).max(150),
  categoryId: z.string().uuid(),
  serialNumber: z.string().max(100).optional(),
  acquisitionDate: z.coerce.date().optional(),
  acquisitionCost: z.number().nonnegative().optional(),
  condition: z.enum(["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"]).optional(),
  location: z.string().max(150).optional(),
  departmentId: z.string().uuid().optional().nullable(),
  isBookable: z.boolean().optional(),
  photoUrl: z.string().url().optional(),
  documentUrls: z.array(z.string().url()).optional(),
  customFieldValues: z.record(z.any()).optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

export const changeAssetStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "ALLOCATED", "RESERVED", "UNDER_MAINTENANCE", "LOST", "RETIRED", "DISPOSED"]),
  reason: z.string().max(300).optional(),
});

export const listAssetsQuerySchema = z.object({
  search: z.string().optional(), // matches tag, serial number, or QR code
  categoryId: z.string().uuid().optional(),
  status: z.enum(["AVAILABLE", "ALLOCATED", "RESERVED", "UNDER_MAINTENANCE", "LOST", "RETIRED", "DISPOSED"]).optional(),
  departmentId: z.string().uuid().optional(),
  location: z.string().optional(),
  isBookable: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
