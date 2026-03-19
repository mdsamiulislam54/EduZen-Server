import { BloodGroup, Gender, StudentStatus } from "../../generated/enums";

export interface ICreateStudent {
    batchId: string[];
    studentData: {
        coachingCenterId: string;
        status?: StudentStatus;
        name: string;
        email: string;
        phone: string;
        image?: string | null;
        dateOfBirth?: Date | null;
        gender: Gender
        bloodGroup: BloodGroup
    }
}
export interface IStudentUpdate {
    batchIds: string[];
    studentData: {
        coachingCenterId: string;
        status?: StudentStatus;
        name?: string;
        email?: string;
        phone?: string;
        image?: string | null;
        dateOfBirth?: Date | null;
        gender?: Gender
        bloodGroup?: BloodGroup
    }
}