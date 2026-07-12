import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.schema";
import * as authController from "./auth.controller";

const router = Router();

// Throttle auth endpoints to blunt brute-force / credential-stuffing attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later." },
});

router.post("/signup", authLimiter, validate(signupSchema), authController.signup);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get("/me", authenticate, authController.me);

export default router;
