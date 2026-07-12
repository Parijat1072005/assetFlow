import app from "./app";
import { env } from "./config/env";
import prisma from "./config/prisma";
import { startCronJobs } from "./utils/cron";

async function main() {
  await prisma.$connect();
  app.listen(env.port, () => {
    console.log(`🚀 AssetFlow API listening on http://localhost:${env.port}`);
    console.log(`   Environment: ${env.nodeEnv}`);
    startCronJobs();
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
