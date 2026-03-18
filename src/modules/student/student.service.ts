import status from "http-status";
import { prisma } from "../../database/prisma";
import { Role, Student } from "../../generated/client";
import { AppError } from "../../shared/errors/app-error";
import { generateRandomPassword } from "../../shared/utils/randomPasswordGenerate";
import { auth } from "../../lib/auth";

const createStudent = async (payload: Student) => {
    const password = generateRandomPassword(8)
    const isExistingStudent = await prisma.student.findUnique({
        where: { email: payload.email },
        select: { id: true }
    });
    if (isExistingStudent) {
        throw new AppError(status.CONFLICT, "Student  already exists");
    }
    const existingUser = await prisma.user.findUnique({
        where: { email: payload.email },
        select: { id: true }
    });
    if (existingUser) {
        throw new AppError(status.CONFLICT, "This email is already associated with an existing user");
    }

    const userData = await auth.api.signUpEmail({
        body: {
            name: payload.name,
            email: payload.email,
            password,
            needPasswordChange: true,
            role: Role.STUDENT,
            teamPassword: password


        }
    });


    let studentData;

    try {
        studentData = await prisma.$transaction(async (tx) => {
            return await tx.student.create({
                data: {
                    ...payload,
                    userId: userData.user.id
                },
                select: {
                    user: true

                }
            })

        });
    } catch (error) {
        await prisma.user.delete({
            where: { id: userData?.user.id }
        });

        throw new AppError(status.BAD_REQUEST, "User Delete")
    }

    return studentData
}


export const studentService = {
    createStudent
}