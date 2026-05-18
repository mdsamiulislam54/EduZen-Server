import { PaymentMethod } from "../../generated/enums";

export interface IPayStudentFee {
    studentId: string,
    batchFeeId: string,
    amount: number,
    paymentMethod: PaymentMethod,

}