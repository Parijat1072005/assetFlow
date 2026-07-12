import prisma from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

export const allocateAsset = async (
  assetId: string,
  holderType: "EMPLOYEE" | "DEPARTMENT",
  createdById: string,
  holderEmployeeId?: string,
  holderDepartmentId?: string,
  expectedReturnDate?: string
) => {
  // Check if asset exists and is available
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) throw ApiError.notFound("Asset not found");
  
  if (asset.status !== "AVAILABLE") {
    throw ApiError.conflict("Asset is not available for allocation. It must be returned or transferred first.");
  }

  // Create allocation in a transaction to ensure asset status updates
  const allocation = await prisma.$transaction(async (tx) => {
    const newAllocation = await tx.allocation.create({
      data: {
        assetId,
        holderType,
        holderEmployeeId,
        holderDepartmentId,
        expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
        status: "ACTIVE",
        createdById,
      },
    });

    await tx.asset.update({
      where: { id: assetId },
      data: { status: "ALLOCATED" },
    });

    // Log activity
    await tx.activityLog.create({
      data: {
        actorId: createdById,
        action: "ASSET_ALLOCATED",
        entityType: "Allocation",
        entityId: newAllocation.id,
      },
    });

    return newAllocation;
  });

  return allocation;
};

export const returnAsset = async (
  allocationId: string,
  userId: string,
  checkInCondition?: "NEW" | "GOOD" | "FAIR" | "POOR" | "DAMAGED",
  checkInNotes?: string
) => {
  const allocation = await prisma.allocation.findUnique({ where: { id: allocationId } });
  if (!allocation) throw ApiError.notFound("Allocation not found");
  if (allocation.status !== "ACTIVE") throw ApiError.badRequest("Only active allocations can be returned");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.allocation.update({
      where: { id: allocationId },
      data: {
        status: "RETURNED",
        actualReturnDate: new Date(),
        checkInCondition,
        checkInNotes,
      },
    });

    await tx.asset.update({
      where: { id: allocation.assetId },
      data: { 
        status: "AVAILABLE",
        condition: checkInCondition || undefined // update condition if provided
      },
    });

    await tx.activityLog.create({
      data: {
        actorId: userId,
        action: "ASSET_RETURNED",
        entityType: "Allocation",
        entityId: allocationId,
      },
    });

    return updated;
  });
};

export const requestTransfer = async (
  assetId: string,
  fromEmployeeId: string,
  toEmployeeId: string,
  reason: string
) => {
  const asset = await prisma.asset.findUnique({ where: { id: assetId }, include: { allocations: { where: { status: "ACTIVE" } } } });
  if (!asset) throw ApiError.notFound("Asset not found");
  
  if (asset.allocations.length === 0) {
    throw ApiError.badRequest("Asset is not currently allocated.");
  }

  const currentAllocation = asset.allocations[0];

  const request = await prisma.transferRequest.create({
    data: {
      assetId,
      currentAllocationId: currentAllocation.id,
      fromEmployeeId,
      toEmployeeId,
      reason,
      status: "REQUESTED",
    },
  });

  // Ideally send notification to Asset Manager / Dept Head here
  
  return request;
};

export const decideTransfer = async (
  transferId: string,
  decidedById: string,
  status: "APPROVED" | "REJECTED",
  expectedReturnDate?: string
) => {
  const transfer = await prisma.transferRequest.findUnique({ where: { id: transferId }, include: { currentAllocation: true } });
  if (!transfer) throw ApiError.notFound("Transfer request not found");
  if (transfer.status !== "REQUESTED") throw ApiError.badRequest("Transfer is already decided");

  if (status === "REJECTED") {
    return prisma.transferRequest.update({
      where: { id: transferId },
      data: {
        status: "REJECTED",
        decidedById,
        decidedAt: new Date(),
      },
    });
  }

  // If approved, close old allocation, create new one
  return prisma.$transaction(async (tx) => {
    // 1. Mark transfer as approved
    const updatedTransfer = await tx.transferRequest.update({
      where: { id: transferId },
      data: {
        status: "APPROVED",
        decidedById,
        decidedAt: new Date(),
      },
    });

    // 2. Mark old allocation as transferred
    if (transfer.currentAllocationId) {
      await tx.allocation.update({
        where: { id: transfer.currentAllocationId },
        data: { status: "TRANSFERRED", actualReturnDate: new Date() },
      });
    }

    // 3. Create new allocation
    await tx.allocation.create({
      data: {
        assetId: transfer.assetId,
        holderType: "EMPLOYEE",
        holderEmployeeId: transfer.toEmployeeId,
        expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
        status: "ACTIVE",
        createdById: decidedById,
      },
    });

    await tx.activityLog.create({
      data: {
        actorId: decidedById,
        action: "TRANSFER_APPROVED",
        entityType: "TransferRequest",
        entityId: transferId,
      },
    });

    return updatedTransfer;
  });
};

export const listAllocations = async (filters: any) => {
  return prisma.allocation.findMany({
    where: filters,
    include: {
      asset: { select: { name: true, assetTag: true } },
      holderEmployee: { select: { name: true, email: true } },
      holderDepartment: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};
