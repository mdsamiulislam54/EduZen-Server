import { Batch } from "../../generated/client";
import { BatchStatus, FeeType } from "../../generated/enums";

export interface ICreateBatchPayload {
  amount: number;
  feeType: FeeType;

  batchData: {
    batchName: string;
    batchCode?: string;
    max_students: number;
    startTime: Date;
    endTime: Date;

    daysOfWeek: (
      | "SUNDAY"
      | "MONDAY"
      | "TUESDAY"
      | "WEDNESDAY"
      | "THURSDAY"
      | "FRIDAY"
      | "SATURDAY"
    )[];
    status: BatchStatus
  }
}


export interface IBatchUpdatePayload {
  amount: number;
  feeType: FeeType;

  batchData: {
    batchName: string;
    batchCode?: string;
    max_students: number;
    startTime: Date;
    endTime: Date;

    daysOfWeek: (
      | "SUNDAY"
      | "MONDAY"
      | "TUESDAY"
      | "WEDNESDAY"
      | "THURSDAY"
      | "FRIDAY"
      | "SATURDAY"
    )[];
    status: BatchStatus
  }

}