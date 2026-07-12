import { z } from "zod";

// customFields describes which optional per-category fields apply to assets,
// e.g. { "warrantyPeriodMonths": { "type": "number", "label": "Warranty (months)" } }
const customFieldDefSchema = z.record(
  z.object({
    type: z.enum(["text", "number", "date", "boolean"]),
    label: z.string(),
    required: z.boolean().optional(),
  })
);

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  customFields: customFieldDefSchema.optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  customFields: customFieldDefSchema.optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
