import { Request, Response } from "express";
import { bookExperienceService } from "../services/booking.service";
import { sendError } from "../utils/errors";

export const bookExperience = async (req: Request, res: Response) => {
  try {
    const booking = await bookExperienceService(
      req.params.id,
      req.user!.userId,
      req.user!.role,
      req.body,
    );
    return res.status(201).json({ booking });
  } catch (err: unknown) {
    const e = err as { status?: number; code?: string; message?: string };
    if (e.status)
      return sendError(
        res,
        e.status,
        e.code || "ERROR",
        e.message || "Something went wrong",
      );
    return sendError(res, 500, "INTERNAL_ERROR", "Something went wrong");
  }
};
