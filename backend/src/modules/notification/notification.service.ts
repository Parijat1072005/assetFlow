import prisma from "../../config/prisma";
import { NotificationType } from "@prisma/client";

/**
 * Creates an in-app notification for a user. Called by other modules
 * whenever a relevant event occurs (asset assigned, booking confirmed, etc).
 */
export async function notifyUser(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    },
  });
}

/**
 * Records an entry in the immutable activity log — the audit trail of
 * "who did what, when" surfaced on the Activity Logs screen.
 */
export async function logActivity(params: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.activityLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata as any,
    },
  });
}

export async function listNotifications(userId: string, unreadOnly = false) {
  return prisma.notification.findMany({
    where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function listActivityLog(filters: {
  entityType?: string;
  entityId?: string;
  actorId?: string;
  take?: number;
}) {
  return prisma.activityLog.findMany({
    where: {
      ...(filters.entityType ? { entityType: filters.entityType } : {}),
      ...(filters.entityId ? { entityId: filters.entityId } : {}),
      ...(filters.actorId ? { actorId: filters.actorId } : {}),
    },
    include: { actor: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: filters.take ?? 200,
  });
}
