import prisma from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { logActivity, notifyUser } from "../notification/notification.service";
import { Prisma, Role } from "@prisma/client";

export async function listEmployees(filters: {
  search?: string;
  departmentId?: string;
  role?: Role;
  status?: "ACTIVE" | "INACTIVE";
  page: number;
  pageSize: number;
}) {
  const where: Prisma.UserWhereInput = {
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { email: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
    ...(filters.role ? { role: filters.role } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };

  const [total, items] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
  ]);

  return { items, total, page: filters.page, pageSize: filters.pageSize };
}

export async function getEmployee(id: string) {
  const employee = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      createdAt: true,
      department: { select: { id: true, name: true } },
    },
  });
  if (!employee) throw ApiError.notFound("Employee not found");
  return employee;
}

export async function updateEmployee(
  actorId: string,
  id: string,
  input: { name?: string; departmentId?: string | null; status?: "ACTIVE" | "INACTIVE"; phone?: string | null }
) {
  await getEmployee(id);
  const employee = await prisma.user.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.departmentId !== undefined ? { departmentId: input.departmentId } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
    },
  });

  await logActivity({ actorId, action: "EMPLOYEE_UPDATED", entityType: "User", entityId: id, metadata: input });
  return employee;
}

/**
 * Promotes (or demotes) an employee's role. This is the ONLY code path in
 * the entire system that changes a user's role — enforced at the route
 * level with requireRole("ADMIN"), and never reachable from signup/login.
 */
export async function promoteEmployee(actorId: string, id: string, newRole: Role) {
  const employee = await getEmployee(id);
  if (employee.role === newRole) {
    throw ApiError.badRequest(`Employee already has role ${newRole}`);
  }

  const updated = await prisma.user.update({ where: { id }, data: { role: newRole } });

  await logActivity({
    actorId,
    action: "EMPLOYEE_ROLE_CHANGED",
    entityType: "User",
    entityId: id,
    metadata: { from: employee.role, to: newRole },
  });

  await notifyUser({
    userId: id,
    type: "GENERAL",
    title: "Your role has been updated",
    message: `An administrator has changed your role from ${employee.role} to ${newRole}.`,
  });

  return updated;
}
