import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

/**
 * Restricts a route to one or more roles. Must run after `authenticate`.
 * Usage: router.post("/departments", authenticate, requireRole("ADMIN"), handler)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires one of roles: ${roles.join(", ")}`));
    }
    next();
  };
}
