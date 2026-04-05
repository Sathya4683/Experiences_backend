import { Router } from "express";
import { bookExperience } from "../controllers/booking.controller";
import {
  blockExperience,
  createExperience,
  listExperiences,
  publishExperience,
} from "../controllers/experience.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { bookExperienceSchema } from "../validators/booking.validator";
import {
  createExperienceSchema,
  listExperiencesSchema,
} from "../validators/experience.validator";

const router = Router();

//Public route - no auth needed for browsing
router.get("/", validate(listExperiencesSchema, "query"), listExperiences);

//Only host or admin can create experiences
router.post(
  "/",
  requireAuth,
  requireRole("host", "admin"),
  validate(createExperienceSchema),
  createExperience,
);

//Owner host or admin can publish
router.patch(
  "/:id/publish",
  requireAuth,
  requireRole("host", "admin"),
  publishExperience,
);

//Admin-only moderation action
router.patch("/:id/block", requireAuth, requireRole("admin"), blockExperience);

//Booking is under experiences for RESTful clarity
router.post(
  "/:id/book",
  requireAuth,
  requireRole("user", "admin"),
  validate(bookExperienceSchema),
  bookExperience,
);

export default router;
