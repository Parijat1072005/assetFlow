import prisma from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

export const createBooking = async (
  assetId: string,
  requestedById: string,
  startTime: string,
  endTime: string,
  purpose?: string
) => {
  // Check if asset exists and is bookable
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) throw ApiError.notFound("Asset not found");
  if (!asset.isBookable) throw ApiError.badRequest("Asset is not marked as bookable");

  const start = new Date(startTime);
  const end = new Date(endTime);

  // Check for overlaps
  const overlappingBookings = await prisma.booking.findMany({
    where: {
      assetId,
      status: { not: "CANCELLED" },
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });

  if (overlappingBookings.length > 0) {
    throw ApiError.conflict("The selected time slot overlaps with an existing booking.");
  }

  // Create booking
  const booking = await prisma.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      data: {
        assetId,
        requestedById,
        startTime: start,
        endTime: end,
        purpose,
        status: "UPCOMING",
      },
    });

    await tx.activityLog.create({
      data: {
        actorId: requestedById,
        action: "BOOKING_CREATED",
        entityType: "Booking",
        entityId: newBooking.id,
      },
    });

    return newBooking;
  });

  return booking;
};

export const cancelBooking = async (
  bookingId: string,
  userId: string,
  cancelledReason?: string
) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw ApiError.notFound("Booking not found");
  if (booking.status === "CANCELLED") throw ApiError.badRequest("Booking is already cancelled");
  
  // Optional: Add logic to only allow the requester or an admin to cancel.

  return prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        cancelledReason,
      },
    });

    await tx.activityLog.create({
      data: {
        actorId: userId,
        action: "BOOKING_CANCELLED",
        entityType: "Booking",
        entityId: bookingId,
      },
    });

    return updated;
  });
};

export const listBookings = async (filters: any) => {
  return prisma.booking.findMany({
    where: filters,
    include: {
      asset: { select: { name: true, assetTag: true } },
      requestedBy: { select: { name: true, email: true } },
    },
    orderBy: { startTime: "asc" },
  });
};
