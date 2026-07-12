import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware";

import authRoutes from "./modules/auth/auth.routes";
import departmentRoutes from "./modules/department/department.routes";
import categoryRoutes from "./modules/category/category.routes";
import employeeRoutes from "./modules/employee/employee.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import assetRoutes from "./modules/asset/asset.routes";
// The following are wired here as they are built out in subsequent phases:
// import allocationRoutes from "./modules/allocation/allocation.routes";
// import bookingRoutes from "./modules/booking/booking.routes";
// import maintenanceRoutes from "./modules/maintenance/maintenance.routes";
// import auditRoutes from "./modules/audit/audit.routes";
// import dashboardRoutes from "./modules/dashboard/dashboard.routes";
// import reportsRoutes from "./modules/reports/reports.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "AssetFlow API is healthy", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/assets", assetRoutes);
// app.use("/api/allocations", allocationRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/maintenance", maintenanceRoutes);
// app.use("/api/audits", auditRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/reports", reportsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
