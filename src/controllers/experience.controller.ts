import { Request, Response } from "express";
import {
  createExperienceService,
  publishExperienceService,
  blockExperienceService,
  listExperiencesService,
} from "../services/experience.service";
import { sendError } from "../utils/errors";

export const createExperience = async (req: Request, res: Response) => {
  try {
    //req.user is guaranteed here because requireAuth ran before this
    const experience = await createExperienceService(req.body, req.user!.userId);
    return res.status(201).json({ experience });
  } catch (err: unknown) {
    const e = err as { status?: number; code?: string; message?: string };
    if (e.status) return sendError(res, e.status, e.code || "ERROR", e.message || "Something went wrong");
    return sendError(res, 500, "INTERNAL_ERROR", "Something went wrong");
  }
};

export const publishExperience = async (req: Request, res: Response) => {
  try {
    const experience = await publishExperienceService(
      req.params.id,
      req.user!.userId,
      req.user!.role
    );
    return res.status(200).json({ experience });
  } catch (err: unknown) {
    const e = err as { status?: number; code?: string; message?: string };
    if (e.status) return sendError(res, e.status, e.code || "ERROR", e.message || "Something went wrong");
    return sendError(res, 500, "INTERNAL_ERROR", "Something went wrong");
  }
};

export const blockExperience = async (req: Request, res: Response) => {
  try {
    const experience = await blockExperienceService(req.params.id);
    return res.status(200).json({ experience });
  } catch (err: unknown) {
    const e = err as { status?: number; code?: string; message?: string };
    if (e.status) return sendError(res, e.status, e.code || "ERROR", e.message || "Something went wrong");
    return sendError(res, 500, "INTERNAL_ERROR", "Something went wrong");
  }
};

export const listExperiences = async (req: Request, res: Response) => {
  try {
    //req.query is already parsed/coerced by our validate middleware
    const result = await listExperiencesService(req.query as never);
    return res.status(200).json(result);
  } catch (err: unknown) {
    const e = err as { status?: number; code?: string; message?: string };
    if (e.status) return sendError(res, e.status, e.code || "ERROR", e.message || "Something went wrong");
    return sendError(res, 500, "INTERNAL_ERROR", "Something went wrong");
  }
};
