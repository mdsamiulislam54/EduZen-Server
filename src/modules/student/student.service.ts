import status from "http-status";
import { prisma } from "../../database/prisma";
import { Role, Student } from "../../generated/client";
import { AppError } from "../../shared/errors/app-error";
import { generateRandomPassword } from "../../shared/utils/randomPasswordGenerate";
import { auth } from "../../lib/auth";
import { ICreateStudent } from "./student.interface";
import { generateRollNumber } from "./utils";

const createStudent = async (payload: ICreateStudent) => {
    const { batchId, studentData } = payload;
    const password = generateRandomPassword(8)
    const isExistingStudent = await prisma.student.findUnique({
        where: { email: studentData.email },
        select: { id: true }
    });
    if (isExistingStudent) {
        throw new AppError(status.CONFLICT, "Student  already exists");
    }
    const existingUser = await prisma.user.findUnique({
        where: { email: studentData.email },
        select: { id: true }
    });
    if (existingUser) {
        throw new AppError(status.CONFLICT, "This email is already associated with an existing user");
    }

    const userData = await auth.api.signUpEmail({
        body: {
            name: studentData.name,
            email: studentData.email,
            password,
            needPasswordChange: true,
            role: Role.STUDENT,
            teamPassword: password


        }
    });

    console.log("..........UserData......", userData)
    let student;

    try {
        student = await prisma.$transaction(async (tx) => {
       
            const s = await tx.student.create({
                data: {
                    ...studentData,
                    userId: userData.user.id,
                    rollNumber: generateRollNumber()
                },
                select: {
                    id: true,
                    user: true

                }
            });
            console.log("..........Student(s)......", s)

            const batchStudentData = batchId.map((batch) => ({
                batchId: batch,
                studentId: s.id
            }))
            console.log("..........BatchStudent......", userData)
            await tx.batchStudent.createMany({
                data: batchStudentData
            });

            const batchFee = await tx.batchFee.findMany({
                where: {
                    batchId: {
                        in: batchId
                    }
                }
            });
            if (batchFee.length !== batchId.length) {
                throw new AppError(status.BAD_REQUEST, "Invalid batch");
            }
            const studentFeeData = batchFee.map((fee) => ({
                studentId: s.id,
                batchFeeId: fee.id,
                amount: fee.amount,
                paidAmount: 0,
                dueAmount: fee.amount

            }));

            await tx.studentFee.createMany({
                data: studentFeeData
            })

            return s
        });
    } catch (error) {
        await prisma.user.delete({
            where: { id: userData?.user.id }
        });

        console.log(".............error...........",error)
        throw new AppError(status.BAD_REQUEST, "User Delete")
    }

    return student
}


export const studentService = {
    createStudent
}