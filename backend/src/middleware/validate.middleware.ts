import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

/**
 * Validates req.body / req.query / req.params against a Zod schema.
 * On success, replaces req[part] with the parsed (and type-coerced) value.
 */
export function validate(
  schema: AnyZodObject,
  part: "body" | "query" | "params" = "body"
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[part]);
      req[part] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(ApiError.badRequest("Validation failed", err.flatten()));
      }
      next(err);
    }
  };
}
