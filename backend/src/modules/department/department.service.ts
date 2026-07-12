import prisma from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { logActivity } from "../notification/notification.service";

export async function listDepartments() {
  return prisma.department.findMany({
    include: {
      head: { select: { id: true, name: true, email: true } },
      parentDept: { select: { id: true, name: true } },
      _count: { select: { members: true, assets: true, childDepartments: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getDepartment(id: string) {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: {
      head: { select: { id: true, name: true, email: true } },
      parentDept: { select: { id: true, name: true } },
      childDepartments: { select: { id: true, name: true } },
      members: { select: { id: true, name: true, email: true, role: true } },
    },
  });
  if (!dept) throw ApiError.notFound("Department not found");
  return dept;
}

export async function createDepartment(
  actorId: string,
  input: { name: string; headId?: string | null; parentDeptId?: string | null }
) {
  if (input.headId) await assertUserExists(input.headId);
  if (input.parentDeptId) await assertDepartmentExists(input.parentDeptId);

  const dept = await prisma.department.create({
    data: {
      name: input.name,
      headId: input.headId ?? null,
      parentDeptId: input.parentDeptId ?? null,
    },
  });

  await logActivity({
    actorId,
    action: "DEPARTMENT_CREATED",
    entityType: "Department",
    entityId: dept.id,
    metadata: { name: dept.name },
  });

  return dept;
}

export async function updateDepartment(
  actorId: string,
  id: string,
  input: { name?: string; headId?: string | null; parentDeptId?: string | null; status?: "ACTIVE" | "INACTIVE" }
) {
  await assertDepartmentExists(id);

  if (input.headId) await assertUserExists(input.headId);

  if (input.parentDeptId) {
    if (input.parentDeptId === id) {
      throw ApiError.badRequest("A department cannot be its own parent");
    }
    await assertDepartmentExists(input.parentDeptId);
    await assertNoCycle(id, input.parentDeptId);
  }

  const dept = await prisma.department.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.headId !== undefined ? { headId: input.headId } : {}),
      ...(input.parentDeptId !== undefined ? { parentDeptId: input.parentDeptId } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
  });

  await logActivity({
    actorId,
    action: "DEPARTMENT_UPDATED",
    entityType: "Department",
    entityId: dept.id,
    metadata: input,
  });

  return dept;
}

export async function deactivateDepartment(actorId: string, id: string) {
  await assertDepartmentExists(id);
  const dept = await prisma.department.update({ where: { id }, data: { status: "INACTIVE" } });
  await logActivity({ actorId, action: "DEPARTMENT_DEACTIVATED", entityType: "Department", entityId: id });
  return dept;
}

// --- helpers -----------------------------------------------------------

async function assertDepartmentExists(id: string) {
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw ApiError.notFound("Department not found");
  return dept;
}

async function assertUserExists(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound("Assigned head user not found");
  return user;
}

/** Walks up the parent chain from `candidateParentId` to ensure `deptId` doesn't appear (would create a cycle). */
async function assertNoCycle(deptId: string, candidateParentId: string) {
  let currentId: string | null = candidateParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === deptId) {
      throw ApiError.badRequest("This would create a circular department hierarchy");
    }
    if (visited.has(currentId)) break; // safety against pre-existing corrupt data
    visited.add(currentId);

    const parent: { parentDeptId: string | null } | null = await prisma.department.findUnique({
      where: { id: currentId },
      select: { parentDeptId: true },
    });
    currentId = parent?.parentDeptId ?? null;
  }
}
