import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as authService from "./auth.service";
import { ApiError } from "../../utils/ApiError";

const REFRESH_COOKIE_NAME = "assetflow_refresh_token";
const isProd = process.env.NODE_ENV === "production";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await authService.signup(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, 201, "Account created successfully", { accessToken, user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, 200, "Logged in successfully", { accessToken, user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) throw ApiError.unauthorized("No refresh token provided");
  const { accessToken } = await authService.refreshAccessToken(token);
  sendSuccess(res, 200, "Token refreshed", { accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
  sendSuccess(res, 200, "Logged out successfully");
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);
  sendSuccess(res, 200, result.message, "devResetLink" in result ? { devResetLink: result.devResetLink } : undefined);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, email, newPassword } = req.body;
  const result = await authService.resetPassword(token, email, newPassword);
  sendSuccess(res, 200, result.message);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const profile = await authService.getProfile(req.user!.id);
  sendSuccess(res, 200, "Current user", profile);
});
