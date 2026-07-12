import { Response } from "express";

/**
 * Sends a consistent JSON envelope for all successful responses:
 * { success: true, message, data, meta? }
 */
export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: Record<string, unknown>
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    ...(meta ? { meta } : {}),
  });
}
