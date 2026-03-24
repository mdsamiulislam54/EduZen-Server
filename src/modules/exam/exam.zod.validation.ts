import z from "zod";
export const createExamSchema = z.object({
  batchId: z.string(),
  subjectId: z.string(),
  name: z.string(),
  totalMarks: z.number(),
  passMarks: z.number(),
  examDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export const updateExamSchema = z.object({
  name: z.string().optional(),
  totalMarks: z.number().optional(),
  passMarks: z.number().optional(),
  examDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});