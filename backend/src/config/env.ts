import dotenv from "dotenv";
dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? "5000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  databaseUrl: required("DATABASE_URL"),
  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  },
  bootstrapAdmin: {
    name: process.env.BOOTSTRAP_ADMIN_NAME ?? "System Admin",
    email: process.env.BOOTSTRAP_ADMIN_EMAIL ?? "admin@assetflow.com",
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "ChangeMe123!",
  },
};
