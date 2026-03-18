import { z } from "zod";
import { SubjectStatus } from "../../generated/enums";

export const subjectSchema = z.object({
  name: z
    .string()
    .min(1, "Subject name is required"),

  subject_code: z
    .string()
    .optional(),

  status: z.nativeEnum(SubjectStatus).optional()
});