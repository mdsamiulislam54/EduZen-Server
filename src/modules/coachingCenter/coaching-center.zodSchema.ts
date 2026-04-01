// schemas/coaching-center.schema.ts

import { z } from 'zod';

export const coachingCenterSchema = z.object({
  name: z.string("Coaching center name is required").min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters"),

  email: z.email()
    .min(5, "Email must be at least 5 characters long")
    .max(100, "Email cannot exceed 100 characters")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),

  phone: z.string()
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format")
    .optional()
    .nullable(),

  image: z.url("Image must be a valid URL")
    .optional()
    .nullable(),

  address: z.string("Address is required").min(5, "Address must be at least 5 characters long")
    .max(500, "Address cannot exceed 500 characters"),

  city: z.string()
    .max(100, "City name cannot exceed 100 characters")
    .optional()
    .nullable(),

  area: z.string()
    .max(100, "Area name cannot exceed 100 characters")
    .optional()
    .nullable(),

  logo: z.string()
    .url("Logo must be a valid URL")
    .optional()
    .nullable(),

  currency: z.string()
    .max(10, "Currency code cannot exceed 10 characters")
    .default("BDT")
    .optional()
    .nullable(),

  plan: z.string()
    .max(50, "Plan name cannot exceed 50 characters")
    .optional()
    .nullable()
});

export const coachingCenterUpdateSchema = z.object({
  name: z.string("Coaching center name is required").min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),

  email: z.email()
    .min(5, "Email must be at least 5 characters long")
    .max(100, "Email cannot exceed 100 characters")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format")
    .optional(),

  phone: z.string()
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format")
    .optional()
    .nullable(),

  image: z.url("Image must be a valid URL")
    .optional()
    .nullable(),

  address: z.string("Address is required").min(5, "Address must be at least 5 characters long")
    .max(500, "Address cannot exceed 500 characters")
    .optional()
    ,

  city: z.string()
    .max(100, "City name cannot exceed 100 characters")
    .optional()
    .nullable(),

  area: z.string()
    .max(100, "Area name cannot exceed 100 characters")
    .optional()
    .nullable(),

  logo: z.string()
    .url("Logo must be a valid URL")
    .optional()
    .nullable(),

  currency: z.string()
    .max(10, "Currency code cannot exceed 10 characters")
    .default("BDT")
    .optional()
    .nullable(),

  plan: z.string()
    .max(50, "Plan name cannot exceed 50 characters")
    .optional()
    .nullable()
});