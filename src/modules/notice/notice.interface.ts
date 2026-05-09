// notice.interface.ts

export interface ICreateNotice {
    title: string;
    description: string;

    type?: "GENERAL" | "EXAM" | "HOLIDAY" | "PAYMENT" | "CLASS";

    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";

    coachingCenterId: string;

    createdBy?: string;
}

export interface IUpdateNotice {
    title?: string;
    description?: string;

    type?: "GENERAL" | "EXAM" | "HOLIDAY" | "PAYMENT" | "CLASS";

    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";

    isPinned?: boolean;

    isPublished?: boolean;
}