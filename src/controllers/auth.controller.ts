import { Request, Response } from "express";
import { signupService, loginService } from "../services/auth.service";
import { sendError } from "../utils/errors";

export const signup = async (req: Request, res: Response) => {
  try {
    const user = await signupService(req.body);
    return res.status(201).json({ user });
  } catch (err: unknown) {
    const e = err as { status?: number; code?: string; message?: string };
    if (e.status) return sendError(res, e.status, e.code || "ERROR", e.message || "Something went wrong");
    return sendError(res, 500, "INTERNAL_ERROR", "Something went wrong");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginService(req.body);
    return res.status(200).json(result);
  } catch (err: unknown) {
    const e = err as { status?: number; code?: string; message?: string };
    if (e.status) return sendError(res, e.status, e.code || "ERROR", e.message || "Something went wrong");
    return sendError(res, 500, "INTERNAL_ERROR", "Something went wrong");
  }
};
