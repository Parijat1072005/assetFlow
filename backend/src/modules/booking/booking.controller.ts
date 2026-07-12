import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as bookingService from "./booking.service";

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const { assetId, purpose, startTime, endTime } = req.body;
  const requestedById = (req as any).user.id;

  const booking = await bookingService.createBooking(assetId, requestedById, startTime, endTime, purpose);

  sendSuccess(res, 201, "Resource booked successfully", booking);
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { cancelledReason } = req.body;
  const userId = (req as any).user.id;

  const booking = await bookingService.cancelBooking(id, userId, cancelledReason);

  sendSuccess(res, 200, "Booking cancelled successfully", booking);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await bookingService.listBookings(req.query);
  sendSuccess(res, 200, "Bookings retrieved successfully", bookings);
});
