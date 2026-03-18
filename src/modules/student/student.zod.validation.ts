import { z } from "zod";
import { BloodGroup, Gender } from "../../generated/enums";



export const studentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email()
        .min(5, "Email must be at least 5 characters")
        .max(100, "Email cannot exceed 100 characters")
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
    dateOfBirth: z
        .preprocess((val) => (val ? new Date(val as string) : undefined), z.date().optional()),
    phone: z
        .string()
        .min(10, "Phone must be at least 10 digits")
        .max(15, "Phone cannot exceed 15 digits"),
    image: z.string().url("Image must be a valid URL").optional(),
    rollNumber: z.string().min(1, "Roll number required").optional(),
    gender: z.nativeEnum(Gender).optional(),
    bloodGroup: z.nativeEnum(BloodGroup).optional(),
});