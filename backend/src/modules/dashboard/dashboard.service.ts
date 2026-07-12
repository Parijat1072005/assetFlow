import prisma from "../../config/prisma";

export const getDashboardStats = async (user: any) => {
  // Common KPIs
  const totalAssets = await prisma.asset.count({ where: { status: { notIn: ["DISPOSED", "RETIRED"] } } });
  const availableAssets = await prisma.asset.count({ where: { status: "AVAILABLE" } });
  const allocatedAssets = await prisma.asset.count({ where: { status: "ALLOCATED" } });
  const maintenanceAssets = await prisma.asset.count({ where: { status: "UNDER_MAINTENANCE" } });

  // Overdue returns
  const now = new Date();
  const overdueAllocations = await prisma.allocation.count({
    where: {
      status: "ACTIVE",
      expectedReturnDate: { lt: now },
    },
  });

  // Active bookings today
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));
  const activeBookings = await prisma.booking.count({
    where: {
      status: { in: ["UPCOMING", "ONGOING"] },
      startTime: { gte: startOfDay, lte: endOfDay },
    },
  });

  return {
    totalAssets,
    availableAssets,
    allocatedAssets,
    maintenanceAssets,
    overdueAllocations,
    activeBookings,
  };
};

export const getDepartmentSummary = async () => {
  return prisma.department.findMany({
    include: {
      _count: {
        select: {
          assets: true,
          allocationsHeld: { where: { status: "ACTIVE" } },
        },
      },
    },
  });
};
