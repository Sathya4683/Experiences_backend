import { z } from "zod";

export const createExperienceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  price: z.number().int().nonnegative("Price must be a non-negative integer"),
  start_time: z.string().datetime("start_time must be a valid ISO datetime string"),
});

//Zod coerces query params from strings to numbers/dates
export const listExperiencesSchema = z.object({
  location: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type ListExperiencesInput = z.infer<typeof listExperiencesSchema>;
