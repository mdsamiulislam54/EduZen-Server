import { z } from "zod";
import { BloodGroup, Gender, StudentStatus } from "../../generated/enums";

// enum convert
const GenderEnum = z.nativeEnum(Gender);
const BloodGroupEnum = z.nativeEnum(BloodGroup);
const StudentStatusEnum = z.nativeEnum(StudentStatus);

export const createStudentSchema = z.object({
    batchId: z
        .array(z.string().min(1, "Batch ID is required"))
        .min(1, "At least one batch is required"),

    studentData: z.object({
        coachingCenterId: z
            .string()
            .min(1, "Coaching Center ID is required"),

        name: z
            .string()
            .min(1, "Name is required")
            .max(100, "Name too long"),

        email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email format")
            .transform((val) => val.toLowerCase().trim()),

        phone: z
            .string()
            .min(1, "Phone is required")
            .regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),

        image: z
            .string()
            .url("Image must be a valid URL")
            .nullable()
            .optional(),

        dateOfBirth: z
            .string()
            .datetime()
            .optional()
            .or(z.date())
            .nullable(),

        gender: GenderEnum.optional(),

        bloodGroup: BloodGroupEnum.optional(),

        status: StudentStatusEnum.optional()
    })
});