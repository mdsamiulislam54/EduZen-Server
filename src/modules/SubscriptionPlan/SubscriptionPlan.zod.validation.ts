import { z } from "zod";

export const subscriptionPlanSchema = z.object({
  name: z.string(),
  price: z.number().min(0),
  duration_days: z.number().min(1),
  max_students: z.number().min(0),
  max_teachers: z.number().min(0),
  max_batches: z.number().min(0),
  has_attendance: z.boolean().optional(),
  has_sms: z.boolean().optional(),
  has_exam: z.boolean().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});