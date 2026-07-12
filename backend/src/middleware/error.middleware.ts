import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { Prisma } from "@prisma/client";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // Known application errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Prisma known request errors (unique constraint, FK violation, etc.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: `Duplicate value for unique field(s): ${(err.meta?.target as string[])?.join(", ")}`,
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    if (err.code === "P2003") {
      return res.status(409).json({ success: false, message: "Related record constraint violation" });
    }
  }

  console.error("Unhandled error:", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return res.status(500).json({ success: false, message: process.env.NODE_ENV === "production" ? "Internal server error" : message });
}
