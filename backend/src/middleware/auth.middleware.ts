import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";

export interface AuthUser {
  id: string;
  role: Role;
  departmentId: string | null;
}

// Augment Express Request with our authenticated user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Verifies the Bearer access token, ensures the user still exists and is
 * ACTIVE (session validation), and attaches req.user for downstream handlers.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Missing or malformed Authorization header");
    }
    const token = header.slice("Bearer ".length);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, departmentId: true, status: true },
    });

    if (!user) throw ApiError.unauthorized("User no longer exists");
    if (user.status !== "ACTIVE") throw ApiError.forbidden("Account is deactivated");

    req.user = { id: user.id, role: user.role, departmentId: user.departmentId };
    next();
  } catch (err) {
    next(ApiError.unauthorized("Invalid or expired session, please log in again"));
  }
}
