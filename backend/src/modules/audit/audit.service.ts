import prisma from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

export const createAuditCycle = async (
  name: string,
  createdById: string,
  startDate: string,
  endDate: string,
  auditorIds: string[],
  departmentId?: string,
  locationScope?: string
) => {
  return prisma.$transaction(async (tx) => {
    // Create the cycle
    const cycle = await tx.auditCycle.create({
      data: {
        name,
        createdById,
        departmentId,
        locationScope,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "PLANNED",
      },
    });

    // Assign auditors
    await tx.auditorAssignment.createMany({
      data: auditorIds.map(id => ({
        auditCycleId: cycle.id,
        auditorId: id,
      })),
    });

    // Determine scope of assets
    const assetFilters: any = { status: { notIn: ["DISPOSED", "RETIRED"] } };
    if (departmentId) assetFilters.departmentId = departmentId;
    if (locationScope) assetFilters.location = locationScope;

    const assetsToAudit = await tx.asset.findMany({ where: assetFilters });

    // Generate AuditItems
    if (assetsToAudit.length > 0) {
      await tx.auditItem.createMany({
        data: assetsToAudit.map(asset => ({
          auditCycleId: cycle.id,
          assetId: asset.id,
          expectedLocation: asset.location,
          verification: "PENDING",
        })),
      });
    }

    await tx.activityLog.create({
      data: {
        actorId: createdById,
        action: "AUDIT_CYCLE_CREATED",
        entityType: "AuditCycle",
        entityId: cycle.id,
      },
    });

    return cycle;
  });
};

export const verifyItem = async (
  cycleId: string,
  itemId: string,
  verifiedById: string,
  verification: "VERIFIED" | "MISSING" | "DAMAGED",
  notes?: string
) => {
  const item = await prisma.auditItem.findUnique({
    where: { id: itemId, auditCycleId: cycleId },
    include: { auditCycle: { include: { auditors: true } } },
  });

  if (!item) throw ApiError.notFound("Audit item not found");
  if (item.auditCycle.status === "CLOSED") throw ApiError.badRequest("Cannot modify items in a closed audit cycle");

  const isAssigned = item.auditCycle.auditors.some(a => a.auditorId === verifiedById);
  if (!isAssigned) {
    // Only assigned auditors can verify
    // For now we could allow admins too, but let's stick to assigned auditors
    throw ApiError.forbidden("You are not assigned to this audit cycle");
  }

  // Update item
  const updated = await prisma.auditItem.update({
    where: { id: itemId },
    data: {
      verification,
      notes,
      verifiedById,
      verifiedAt: new Date(),
    },
  });

  // Automatically start cycle if first item verified
  if (item.auditCycle.status === "PLANNED") {
    await prisma.auditCycle.update({
      where: { id: cycleId },
      data: { status: "IN_PROGRESS" },
    });
  }

  return updated;
};

export const closeAuditCycle = async (cycleId: string, userId: string) => {
  const cycle = await prisma.auditCycle.findUnique({
    where: { id: cycleId },
    include: { items: true },
  });

  if (!cycle) throw ApiError.notFound("Audit cycle not found");
  if (cycle.status === "CLOSED") throw ApiError.badRequest("Audit cycle is already closed");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.auditCycle.update({
      where: { id: cycleId },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    });

    // Update asset statuses based on discrepancies
    for (const item of cycle.items) {
      if (item.verification === "MISSING") {
        await tx.asset.update({
          where: { id: item.assetId },
          data: { status: "LOST" },
        });
      } else if (item.verification === "DAMAGED") {
        await tx.asset.update({
          where: { id: item.assetId },
          data: { condition: "DAMAGED" },
        });
      }
    }

    await tx.activityLog.create({
      data: {
        actorId: userId,
        action: "AUDIT_CYCLE_CLOSED",
        entityType: "AuditCycle",
        entityId: cycleId,
      },
    });

    return updated;
  });
};

export const listAuditCycles = async (filters: any) => {
  return prisma.auditCycle.findMany({
    where: filters,
    include: {
      department: { select: { name: true } },
      createdBy: { select: { name: true } },
      auditors: { include: { auditor: { select: { name: true } } } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAuditItems = async (cycleId: string) => {
  return prisma.auditItem.findMany({
    where: { auditCycleId: cycleId },
    include: {
      asset: { select: { assetTag: true, name: true, location: true } },
      verifiedBy: { select: { name: true } },
    },
    orderBy: { asset: { assetTag: "asc" } },
  });
};
