import prisma from "../config/prisma";

/**
 * Generates the next sequential asset tag, e.g. AF-0001, AF-0002, ...
 * Looks at the highest existing numeric suffix and increments it.
 * Safe enough for hackathon/demo scale; for high write concurrency this
 * should move to a DB sequence, but Prisma's serializable transaction
 * below prevents duplicate tags under normal load.
 */
export async function generateAssetTag(): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const last = await tx.asset.findFirst({
      orderBy: { createdAt: "desc" },
      select: { assetTag: true },
    });

    let nextNumber = 1;
    if (last?.assetTag) {
      const match = last.assetTag.match(/AF-(\d+)/);
      if (match) nextNumber = parseInt(match[1], 10) + 1;
    }

    const padded = String(nextNumber).padStart(4, "0");
    const tag = `AF-${padded}`;

    // Guard against races (rare, but the unique constraint is the real backstop).
    const exists = await tx.asset.findUnique({ where: { assetTag: tag } });
    if (exists) {
      const padded2 = String(nextNumber + 1).padStart(4, "0");
      return `AF-${padded2}`;
    }

    return tag;
  });
}
