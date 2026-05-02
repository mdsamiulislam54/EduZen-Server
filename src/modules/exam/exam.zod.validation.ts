import z from "zod";
export const createExamSchema = z.object({
  batchId: z.string().min(1, "Batch is required"),
  subjectId: z.string().min(1, "Subject is required"),
  name: z.string().min(3, "Exam name must be at least 3 characters"),
  totalMarks: z
    .number("Total marks is required")
    .min(1, "Total marks must be greater than 0"),

  passMarks: z
    .number("Pass marks is required")
    .min(1, "Pass marks must be greater than 0"),

  examDate: z.string().min(1, "Exam date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),

  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]),
});
export type ExamFormValues = z.infer<typeof createExamSchema>;
export const updateExamSchema = z.object({
  name: z.string().optional(),
  totalMarks: z.number().optional(),
  passMarks: z.number().optional(),
  examDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});