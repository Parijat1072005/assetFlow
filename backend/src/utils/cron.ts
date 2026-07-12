import cron from "node-cron";
import prisma from "../config/prisma";

/**
 * Runs daily at midnight.
 * Marks overdue active allocations and auto-transitions bookings.
 */
export const startCronJobs = () => {
  // ── 1. Flag overdue allocations ───────────────────────────────────────────
  // Runs every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Checking for overdue allocations...");
    try {
      const now = new Date();
      const overdueAllocations = await prisma.allocation.findMany({
        where: {
          status: "ACTIVE",
          expectedReturnDate: { lt: now },
        },
        include: {
          holderEmployee: { select: { id: true, name: true } },
          asset: { select: { name: true, assetTag: true } },
        },
      });

      for (const allocation of overdueAllocations) {
        if (allocation.holderEmployee) {
          await prisma.notification.create({
            data: {
              userId: allocation.holderEmployee.id,
              type: "OVERDUE_RETURN",
              title: "Overdue Asset Return",
              message: `Asset "${allocation.asset.name}" (${allocation.asset.assetTag}) was due for return. Please return it immediately.`,
            },
          });
        }
      }

      console.log(`[CRON] Sent overdue notifications for ${overdueAllocations.length} allocations.`);
    } catch (err) {
      console.error("[CRON] Overdue allocation check failed:", err);
    }
  });

  // ── 2. Auto-transition bookings: UPCOMING → ONGOING → COMPLETED ──────────
  // Runs every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    try {
      const now = new Date();

      // Mark UPCOMING bookings that have started as ONGOING
      await prisma.booking.updateMany({
        where: {
          status: "UPCOMING",
          startTime: { lte: now },
          endTime: { gt: now },
        },
        data: { status: "ONGOING" },
      });

      // Mark ONGOING bookings that have ended as COMPLETED
      await prisma.booking.updateMany({
        where: {
          status: "ONGOING",
          endTime: { lte: now },
        },
        data: { status: "COMPLETED" },
      });
    } catch (err) {
      console.error("[CRON] Booking status transition failed:", err);
    }
  });

  // ── 3. Booking reminders (30 minutes before start) ───────────────────────
  // Runs every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    try {
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

      const upcomingBookings = await prisma.booking.findMany({
        where: {
          status: "UPCOMING",
          startTime: {
            gte: now,
            lte: thirtyMinutesFromNow,
          },
        },
        include: {
          requestedBy: { select: { id: true } },
          asset: { select: { name: true, assetTag: true } },
        },
      });

      for (const booking of upcomingBookings) {
        // Avoid duplicate notifications (we'll do a simple check)
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: booking.requestedBy.id,
            type: "BOOKING_REMINDER",
            link: `/bookings/${booking.id}`,
          },
        });

        if (!existingNotification) {
          await prisma.notification.create({
            data: {
              userId: booking.requestedBy.id,
              type: "BOOKING_REMINDER",
              title: "Upcoming Booking Reminder",
              message: `Your booking for "${booking.asset.name}" (${booking.asset.assetTag}) starts in 30 minutes.`,
              link: `/bookings/${booking.id}`,
            },
          });
        }
      }
    } catch (err) {
      console.error("[CRON] Booking reminder failed:", err);
    }
  });

  console.log("[CRON] Scheduled jobs started.");
};
