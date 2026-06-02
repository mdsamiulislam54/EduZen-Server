

export type PaymentMethod = "CASH" | "BKASH" | "NAGAD" | "BANK"

export type PaymentStatus =
    | "PENDING"
    | "PARTIAL"
    | "PAID"
    | "OVERDUE"
    | "FAILED"

export interface IStudentPaymentAction {
    studentId: string
    fees: {
        batchFeeId: string
        amount: number
        paidAmount: number
    }[]
    amount: number
    paidAmount: number
    dueAmount?: number
    paymentMethod: PaymentMethod
    paymentStatus?: PaymentStatus
}