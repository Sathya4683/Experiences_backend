import { z } from "zod";

//Only user and host can self-register; admin accounts are created separately
export const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["user", "host"], {
    errorMap: () => ({ message: "Role must be 'user' or 'host'" }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
