import { AssetStatus } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";

/**
 * Defines which lifecycle transitions are legal. Most transitions happen
 * automatically as a side-effect of other modules (allocation, maintenance,
 * audit), but this table is also enforced for direct/manual status changes
 * by an Asset Manager or Admin (e.g. marking something Lost or Disposed).
 */
const ALLOWED_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  AVAILABLE: ["ALLOCATED", "RESERVED", "UNDER_MAINTENANCE", "LOST", "RETIRED"],
  ALLOCATED: ["AVAILABLE", "LOST"],
  RESERVED: ["AVAILABLE", "ALLOCATED"],
  UNDER_MAINTENANCE: ["AVAILABLE", "RETIRED", "DISPOSED"],
  LOST: ["AVAILABLE", "RETIRED", "DISPOSED"],
  RETIRED: ["DISPOSED"],
  DISPOSED: [],
};

export function assertValidTransition(from: AssetStatus, to: AssetStatus) {
  if (from === to) return; // no-op is fine
  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw ApiError.badRequest(`Invalid asset status transition: ${from} → ${to}`);
  }
}
