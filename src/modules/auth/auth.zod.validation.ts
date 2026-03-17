import { z } from "zod";

export const createUserSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),

  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
});