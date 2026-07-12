import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    assetId: z.string().uuid("Invalid asset ID"),
    purpose: z.string().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  }).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: "endTime must be after startTime",
    path: ["endTime"],
  }),
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]),
    cancelledReason: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ID"),
  }),
});
