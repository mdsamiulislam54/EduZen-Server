import { Gender, TeacherStatus } from "../../generated/enums";

export interface ITeacher {
    subjectIds: string[]
    teacherData: {
        name: string;
        email: string;
        phone: string;
        education?: string;
        address?: string;
        dateOfBirth?: Date;
        image?: string;
        experience?: number;
        gender?: Gender
        status?: TeacherStatus
    }
}
export interface ITeacherUpdate {
    subjectIds: string[]
    teacherData: {
        name?: string;
        email?: string;
        phone?: string;
        education?: string;
        address?: string;
        dateOfBirth?: Date;
        image?: string;
        experience?: number;
        gender?: Gender
        status?: TeacherStatus
    }
}