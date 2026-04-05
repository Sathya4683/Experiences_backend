import { z } from "zod";

export const bookExperienceSchema = z.object({
  seats: z.number().int().min(1, "seats must be at least 1"),
});

export type BookExperienceInput = z.infer<typeof bookExperienceSchema>;
