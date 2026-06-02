

export type ContactStatusType = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
export interface ContactMessage {
    fullName: string;
    email: string;
    message: string;
    phone?: string;
    subject: string;
    status: ContactStatusType;
    source?: string; 
}