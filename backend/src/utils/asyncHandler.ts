import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async Express route handler so any thrown error / rejected promise
 * is forwarded to next(), where the global error middleware handles it.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
