import { z } from "zod";
import { AttendanceStatus } from "../../generated/enums";

export const createAttendanceSchema = z.object({
    batchId: z.string({
        error: "Batch ID is required",
    }),

    studentId: z.string({
        error: "Student ID is required",
    }),

    date: z.string().optional(), 

    status: z.enum([AttendanceStatus.ABSENT,AttendanceStatus.PRESENT], {
        error: "Status is required",
    }),

    markBy: z.string().optional(),

    remarks: z.string().optional(),
});

export const updateAttendanceSchema = z.object({
  status: z.enum([AttendanceStatus.ABSENT,AttendanceStatus.PRESENT]).optional(),
  remarks: z.string().optional(),
});