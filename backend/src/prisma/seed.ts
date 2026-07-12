import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { env } from "../config/env";

/**
 * Bootstraps exactly one Admin account so the system can be used at all —
 * signup can never create an Admin, and promotion requires an existing Admin.
 * Safe to re-run: no-ops if an Admin already exists.
 *
 * Run with: npm run seed
 */
async function main() {
  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existingAdmin) {
    console.log(`✅ Admin already exists (${existingAdmin.email}) — skipping bootstrap.`);
    return;
  }

  const passwordHash = await bcrypt.hash(env.bootstrapAdmin.password, 12);
  const admin = await prisma.user.create({
    data: {
      name: env.bootstrapAdmin.name,
      email: env.bootstrapAdmin.email,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("✅ Bootstrap admin created:");
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${env.bootstrapAdmin.password}`);
  console.log("   ⚠️  Log in and change this password immediately in a real deployment.");

  // A few starter categories so the Assets screen isn't empty on first run.
  const categoryNames = ["Electronics", "Furniture", "Vehicles", "IT Equipment"];
  for (const name of categoryNames) {
    await prisma.assetCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✅ Seeded ${categoryNames.length} starter asset categories.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
