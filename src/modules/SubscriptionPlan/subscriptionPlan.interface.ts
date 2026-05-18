export interface ICheckoutPayload {
    subscriptionId: string
}
export interface ICheckoutPayloadStudent {
    studentId: string
};

export type TSubscriptionPlan = {
  id?: string,
  name: string;
  price: number;
  duration_days: number;
  max_students: number;
  max_teachers: number;
  max_batches: number;
  has_attendance?: boolean;
  has_sms?: boolean;
  has_exam?: boolean;
  features: string[]
  status?: "ACTIVE" | "INACTIVE";
};