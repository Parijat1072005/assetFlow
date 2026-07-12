import prisma from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { MaintenancePriority } from "@prisma/client";

export const raiseRequest = async (
  assetId: string,
  raisedById: string,
  issueDescription: string,
  priority?: MaintenancePriority,
  photoUrl?: string
) => {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) throw ApiError.notFound("Asset not found");

  const request = await prisma.maintenanceRequest.create({
    data: {
      assetId,
      raisedById,
      issueDescription,
      priority: priority || "MEDIUM",
      photoUrl,
      status: "PENDING",
    },
  });

  return request;
};

export const decideRequest = async (
  requestId: string,
  decidedById: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string
) => {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
  if (!request) throw ApiError.notFound("Maintenance request not found");
  if (request.status !== "PENDING") throw ApiError.badRequest("Request is already decided");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status,
        decidedById,
        decidedAt: new Date(),
        rejectionReason,
      },
    });

    if (status === "APPROVED") {
      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: "UNDER_MAINTENANCE" },
      });
    }

    await tx.activityLog.create({
      data: {
        actorId: decidedById,
        action: `MAINTENANCE_${status}`,
        entityType: "MaintenanceRequest",
        entityId: requestId,
      },
    });

    return updated;
  });
};

export const assignTechnician = async (requestId: string, technicianId: string) => {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
  if (!request) throw ApiError.notFound("Maintenance request not found");
  if (request.status !== "APPROVED") throw ApiError.badRequest("Request must be APPROVED to assign a technician");

  return prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: {
      status: "TECHNICIAN_ASSIGNED",
      technicianId,
    },
  });
};

export const updateProgress = async (
  requestId: string,
  technicianId: string,
  status: "IN_PROGRESS" | "RESOLVED",
  technicianNote?: string
) => {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
  if (!request) throw ApiError.notFound("Maintenance request not found");
  
  if (request.technicianId !== technicianId) {
    throw ApiError.forbidden("You are not the assigned technician for this request");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status,
        technicianNote,
        resolvedAt: status === "RESOLVED" ? new Date() : null,
      },
    });

    if (status === "RESOLVED") {
      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: "AVAILABLE" },
      });
    }

    await tx.activityLog.create({
      data: {
        actorId: technicianId,
        action: `MAINTENANCE_${status}`,
        entityType: "MaintenanceRequest",
        entityId: requestId,
      },
    });

    return updated;
  });
};

export const listRequests = async (filters: any) => {
  return prisma.maintenanceRequest.findMany({
    where: filters,
    include: {
      asset: { select: { name: true, assetTag: true } },
      raisedBy: { select: { name: true } },
      technician: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};
