import { z } from "zod";

export const upsertMarkSchema = z.object({
  examId: z.string(),
  marks: z
    .array(
      z.object({
        studentId: z.string(),
        mark: z.coerce.number().min(0),
      })
    )
    .min(1),
});