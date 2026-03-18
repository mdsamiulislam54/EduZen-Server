import { z } from "zod";
import { BatchStatus, FeeType } from "../../generated/enums";

export const batchSchema = z.object({
  amount: z.number(),
  feeType: z.enum([FeeType.ADMISSION,FeeType.COURSE,FeeType.EXAM,FeeType.MONTHLY]),
  batchData: z.object({
    batchName: z.string().min(1, "Batch name is required"),
    batchCode: z.string().optional(),
    max_students: z.number("Max students must be a number").int("Max students must be an integer").positive("Max students must be greater than 0"),
    startTime: z.preprocess((val) => new Date(val as string), z.date("Start time is required")),
    endTime: z.preprocess((val) => new Date(val as string), z.date("End time is required")),

    daysOfWeek: z.array(
      z.enum([
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY"
      ])
    ),

    status: z.enum([BatchStatus.ACTIVE, BatchStatus.COMPLETED,BatchStatus.INACTIVE])
  }),
}).refine((data) => data.batchData.endTime > data.batchData.startTime, {
  message: "End time must be after start time",
  path: ["data", "endTime"]
});



