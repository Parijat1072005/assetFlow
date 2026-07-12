import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { env } from "../../config/env";
import { SignupInput, LoginInput } from "./auth.schema";
import { logActivity } from "../notification/notification.service";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Signup ALWAYS creates a plain EMPLOYEE account. There is no role field
 * accepted from the client. Promotion to Department Head / Asset Manager
 * happens exclusively through the Admin's Employee Directory (see
 * employee.service.ts `promoteEmployee`), per the "no self-elevation" rule.
 */
export async function signup(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: "EMPLOYEE",
    },
  });

  await logActivity({
    actorId: user.id,
    action: "USER_SIGNED_UP",
    entityType: "User",
    entityId: user.id,
  });

  return issueTokenPair(user.id, user.role, user.departmentId);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  if (user.status !== "ACTIVE") {
    throw ApiError.forbidden("This account has been deactivated. Contact your admin.");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  await logActivity({
    actorId: user.id,
    action: "USER_LOGGED_IN",
    entityType: "User",
    entityId: user.id,
  });

  return issueTokenPair(user.id, user.role, user.departmentId);
}

async function issueTokenPair(userId: string, role: any, departmentId: string | null) {
  const accessToken = signAccessToken({ sub: userId, role, departmentId });
  const refreshToken = signRefreshToken(userId);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, departmentId: true, status: true },
  });

  return { accessToken, refreshToken, user };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token is no longer valid, please log in again");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.status !== "ACTIVE") throw ApiError.unauthorized("Account unavailable");

  const accessToken = signAccessToken({ sub: user.id, role: user.role, departmentId: user.departmentId });
  return { accessToken };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true },
  });
}

/**
 * Forgot-password flow: issues a short-lived reset token. Since this project
 * intentionally avoids third-party services, no email is actually sent —
 * in development the token/link is returned directly in the API response
 * (clearly marked) so the flow is demoable end-to-end. Swap in a real
 * mailer (SES/SendGrid/etc.) in production by replacing `deliverResetLink`.
 */
export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond success-shaped to avoid leaking which emails are registered.
  if (!user) return { message: "If that email exists, a reset link has been generated." };

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  // Store the reset token (hashed, `reset:` prefixed) as a short-lived record
  // in the same RefreshToken table rather than adding a parallel table.
  await prisma.refreshToken.create({
    data: {
      token: `reset:${tokenHash}`,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    },
  });

  const resetLink = `${env.clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

  return {
    message: "If that email exists, a reset link has been generated.",
    ...(env.nodeEnv !== "production" ? { devResetLink: resetLink } : {}),
  };
}

export async function resetPassword(token: string, email: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.badRequest("Invalid or expired reset link");

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.refreshToken.findUnique({ where: { token: `reset:${tokenHash}` } });

  if (!record || record.userId !== user.id || record.revoked || record.expiresAt < new Date()) {
    throw ApiError.badRequest("Invalid or expired reset link");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } }),
    // Revoke all active sessions on password reset.
    prisma.refreshToken.updateMany({ where: { userId: user.id, revoked: false }, data: { revoked: true } }),
  ]);

  return { message: "Password has been reset. Please log in with your new password." };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      department: { select: { id: true, name: true } },
      createdAt: true,
    },
  });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}
