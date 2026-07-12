import prisma from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { generateAssetTag } from "../../utils/generateAssetTag";
import { logActivity } from "../notification/notification.service";
import { assertValidTransition } from "./asset.stateMachine";
import { AssetStatus, Prisma } from "@prisma/client";

export async function listAssets(filters: {
  search?: string;
  categoryId?: string;
  status?: AssetStatus;
  departmentId?: string;
  location?: string;
  isBookable?: boolean;
  page: number;
  pageSize: number;
}) {
  const where: Prisma.AssetWhereInput = {
    ...(filters.search
      ? {
          OR: [
            { assetTag: { contains: filters.search, mode: "insensitive" } },
            { serialNumber: { contains: filters.search, mode: "insensitive" } },
            { qrCode: { contains: filters.search, mode: "insensitive" } },
            { name: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
    ...(filters.location ? { location: { contains: filters.location, mode: "insensitive" } } : {}),
    ...(filters.isBookable !== undefined ? { isBookable: filters.isBookable } : {}),
  };

  const [total, items] = await prisma.$transaction([
    prisma.asset.count({ where }),
    prisma.asset.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        registeredBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
  ]);

  return { items, total, page: filters.page, pageSize: filters.pageSize };
}

export async function getAsset(id: string) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      category: true,
      department: { select: { id: true, name: true } },
      registeredBy: { select: { id: true, name: true, email: true } },
    },
  });
  if (!asset) throw ApiError.notFound("Asset not found");
  return asset;
}

/** Combined allocation + maintenance history shown on the asset detail view. */
export async function getAssetHistory(id: string) {
  await getAsset(id);
  const [allocations, maintenance] = await Promise.all([
    prisma.allocation.findMany({
      where: { assetId: id },
      include: {
        holderEmployee: { select: { id: true, name: true } },
        holderDepartment: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { allocatedDate: "desc" },
    }),
    prisma.maintenanceRequest.findMany({
      where: { assetId: id },
      include: {
        raisedBy: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { allocations, maintenance };
}

export async function createAsset(
  actorId: string,
  input: {
    name: string;
    categoryId: string;
    serialNumber?: string;
    acquisitionDate?: Date;
    acquisitionCost?: number;
    condition?: "NEW" | "GOOD" | "FAIR" | "POOR" | "DAMAGED";
    location?: string;
    departmentId?: string | null;
    isBookable?: boolean;
    photoUrl?: string;
    documentUrls?: string[];
    customFieldValues?: Record<string, unknown>;
  }
) {
  const category = await prisma.assetCategory.findUnique({ where: { id: input.categoryId } });
  if (!category) throw ApiError.notFound("Asset category not found");

  if (input.departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: input.departmentId } });
    if (!dept) throw ApiError.notFound("Department not found");
  }

  const assetTag = await generateAssetTag();

  const asset = await prisma.asset.create({
    data: {
      assetTag,
      name: input.name,
      categoryId: input.categoryId,
      serialNumber: input.serialNumber,
      acquisitionDate: input.acquisitionDate,
      acquisitionCost: input.acquisitionCost,
      condition: input.condition ?? "GOOD",
      status: "AVAILABLE",
      location: input.location,
      departmentId: input.departmentId ?? null,
      isBookable: input.isBookable ?? false,
      photoUrl: input.photoUrl,
      documentUrls: input.documentUrls ?? [],
      customFieldValues: input.customFieldValues as any,
      registeredById: actorId,
    },
  });

  await logActivity({
    actorId,
    action: "ASSET_REGISTERED",
    entityType: "Asset",
    entityId: asset.id,
    metadata: { assetTag: asset.assetTag, name: asset.name },
  });

  return asset;
}

export async function updateAsset(actorId: string, id: string, input: Record<string, any>) {
  await getAsset(id);

  if (input.categoryId) {
    const category = await prisma.assetCategory.findUnique({ where: { id: input.categoryId } });
    if (!category) throw ApiError.notFound("Asset category not found");
  }
  if (input.departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: input.departmentId } });
    if (!dept) throw ApiError.notFound("Department not found");
  }

  const asset = await prisma.asset.update({
    where: { id },
    data: input,
  });

  await logActivity({ actorId, action: "ASSET_UPDATED", entityType: "Asset", entityId: id, metadata: input });
  return asset;
}

/**
 * Manual/administrative status change (e.g. marking Lost, Retired, Disposed,
 * or force-recovering from Lost). Automated transitions triggered by
 * allocation/maintenance/audit flows call `transitionAssetStatus` directly
 * within their own service (bypassing this HTTP-facing wrapper) so they can
 * run inside the same DB transaction as their own state changes.
 */
export async function changeAssetStatus(actorId: string, id: string, newStatus: AssetStatus, reason?: string) {
  const asset = await getAsset(id);
  assertValidTransition(asset.status, newStatus);

  const updated = await prisma.asset.update({ where: { id }, data: { status: newStatus } });

  await logActivity({
    actorId,
    action: "ASSET_STATUS_CHANGED",
    entityType: "Asset",
    entityId: id,
    metadata: { from: asset.status, to: newStatus, reason },
  });

  return updated;
}

/** Used internally by other modules (allocation, maintenance, audit) inside their own transactions. */
export async function transitionAssetStatus(
  tx: Prisma.TransactionClient,
  assetId: string,
  from: AssetStatus,
  to: AssetStatus
) {
  assertValidTransition(from, to);
  return tx.asset.update({ where: { id: assetId }, data: { status: to } });
}
