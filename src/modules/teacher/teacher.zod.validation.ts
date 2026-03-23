import { z } from "zod";
import { Gender, TeacherStatus } from "../../generated/enums";

export const createTeacherSchema = z.object({
    subjectIds: z
        .array(z.string("Subject ID must be string"))
        .min(1, "At least one subject is required"),

    teacherData: z.object({
        name: z.string("Name is required"),

        email: z
            .string("Email is required")
            .email("Invalid email format"),

        phone: z.string("Phone is required"),

        education: z.string().optional(),

        address: z.string().optional(),

        dateOfBirth: z
            .string()
            .optional()
            .transform((val) => (val ? new Date(val) : undefined)),

        image: z.string().url().optional(),

        experience: z
            .number()
            .int()
            .nonnegative("Experience cannot be negative")
            .optional(),

        gender: z.enum([Gender.FEMALE, Gender.OTHER, Gender.MALE]).optional(),

        status: z
            .enum([TeacherStatus.ACTIVE, TeacherStatus.INACTIVE, TeacherStatus.ON_LEAVE])
            .optional()
            .default("ACTIVE"),
    }),
});
export const updateTeacherSchema = z.object({
    subjectIds: z
        .array(z.string("Subject ID must be string"))
        .min(0, "At least one subject is required")
        .optional(),

    teacherData: z.object({
        name: z.string("Name is required").optional(),

        email: z
            .string("Email is required")
            .email("Invalid email format").optional(),

        phone: z.string("Phone is required").optional(),

        education: z.string().optional(),

        address: z.string().optional(),

        dateOfBirth: z
            .string()
            .optional()
            .transform((val) => (val ? new Date(val) : undefined)),

        image: z.string().url().optional(),

        experience: z
            .number()
            .int()
            .nonnegative("Experience cannot be negative")
            .optional(),

        gender: z.enum([Gender.FEMALE, Gender.OTHER, Gender.MALE]).optional(),

        status: z
            .enum([TeacherStatus.ACTIVE, TeacherStatus.INACTIVE, TeacherStatus.ON_LEAVE])
            .optional()
            .default("ACTIVE"),
    }),
});