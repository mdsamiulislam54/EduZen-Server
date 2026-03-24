import { z } from "zod";

export const upsertMarkSchema = z.object({
  studentId: z.string(),
  examId: z.string(),
  mark: z.number().min(0),
});