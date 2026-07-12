import prisma from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { logActivity } from "../notification/notification.service";

export async function listCategories() {
  return prisma.assetCategory.findMany({
    include: { _count: { select: { assets: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getCategory(id: string) {
  const category = await prisma.assetCategory.findUnique({ where: { id } });
  if (!category) throw ApiError.notFound("Asset category not found");
  return category;
}

export async function createCategory(
  actorId: string,
  input: { name: string; description?: string; customFields?: Record<string, unknown> }
) {
  const category = await prisma.assetCategory.create({
    data: {
      name: input.name,
      description: input.description,
      customFields: input.customFields as any,
    },
  });
  await logActivity({ actorId, action: "CATEGORY_CREATED", entityType: "AssetCategory", entityId: category.id });
  return category;
}

export async function updateCategory(
  actorId: string,
  id: string,
  input: { name?: string; description?: string; customFields?: Record<string, unknown> }
) {
  await getCategory(id);
  const category = await prisma.assetCategory.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.customFields !== undefined ? { customFields: input.customFields as any } : {}),
    },
  });
  await logActivity({ actorId, action: "CATEGORY_UPDATED", entityType: "AssetCategory", entityId: id });
  return category;
}

export async function deleteCategory(actorId: string, id: string) {
  await getCategory(id);
  const assetCount = await prisma.asset.count({ where: { categoryId: id } });
  if (assetCount > 0) {
    throw ApiError.conflict(`Cannot delete category with ${assetCount} asset(s) still assigned to it`);
  }
  await prisma.assetCategory.delete({ where: { id } });
  await logActivity({ actorId, action: "CATEGORY_DELETED", entityType: "AssetCategory", entityId: id });
}
