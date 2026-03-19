import status from "http-status";
import { prisma } from "../../database/prisma";
import { Role, Student } from "../../generated/client";
import { AppError } from "../../shared/errors/app-error";
import { generateRandomPassword } from "../../shared/utils/randomPasswordGenerate";
import { auth } from "../../lib/auth";
import { ICreateStudent, IStudentUpdate } from "./student.interface";
import { generateRollNumber } from "./utils";
import ApiError from "../../shared/errors/api-error";
import { email } from "zod";
import { name } from "ejs";

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

        console.log(".............error...........", error)
        throw new AppError(status.BAD_REQUEST, "User Delete")
    }

    return student
}

const getAllStudent = async () => {

    return await prisma.student.findMany({
        where: {
            isDeleted: false
        },

    })
}
const getStudentById = async (id: string) => {
    const isExistStudent = prisma.student.findUnique({ where: { id, isDeleted: false } });
    if (!isExistStudent) {
        throw new ApiError(status.BAD_REQUEST, "Student not found by id")
    }
    return await prisma.student.findMany({
        where: {
            isDeleted: false,
            id
        },
        include: {
            attendances: true,
            batchStudents: true,
            coachingCenter: true,
            marks: true,
            results: true,
            studentFees: true,
            user: true,
            _count: true
        }
    })
}



const updateStudent = async (payload: IStudentUpdate, studentId: string) => {
    const { studentData, batchIds } = payload;

    const existingStudent = await prisma.student.findUnique({
        where: { id: studentId },
        include: { user: true, batchStudents: true }
    });

    if (!existingStudent) {
        throw new AppError(status.NOT_FOUND, "Student not found");
    }

    let updatedStudent;

    try {
        updatedStudent = await prisma.$transaction(async (tx) => {

            const s = await tx.student.update({
                where: { id: studentId },
                data: {
                    ...studentData,
                },
                select: {
                    id: true,
                    user: true,
                },
            });


            const userUpdateData: any = {};
            if (studentData.name) userUpdateData.name = studentData.name;
            if (studentData.email) userUpdateData.email = studentData.email.toLowerCase().trim();

            if (Object.keys(userUpdateData).length > 0) {
                await tx.user.update({
                    where: { id: existingStudent.userId },
                    data: userUpdateData
                });
            }
            if (batchIds) {
                await tx.batchStudent.deleteMany({
                    where: {
                        studentId,
                        batchId: { notIn: batchIds },
                    },
                });

                const existingBatchIds = existingStudent.batchStudents.map(b => b.batchId);
                const newBatchIds = batchIds.filter(id => !existingBatchIds.includes(id));

                const batchStudentData = newBatchIds.map(batch => ({
                    studentId,
                    batchId: batch
                }));

                if (batchStudentData.length > 0) {
                    await tx.batchStudent.createMany({ data: batchStudentData });
                }
                const newBatchFees = await tx.batchFee.findMany({
                    where: { batchId: { in: newBatchIds } }
                });

                const studentFeeData = newBatchFees.map(fee => ({
                    studentId,
                    batchFeeId: fee.id,
                    batchId: fee.batchId,
                    amount: fee.amount,
                    paidAmount: 0,
                    dueAmount: fee.amount
                }));

                if (studentFeeData.length > 0) {
                    await tx.studentFee.createMany({ data: studentFeeData });
                }
            }
            return s;
        });
    } catch (error: any) {
        console.error("UpdateStudent Transaction Error:", error);

        if (error.code === "P2002") {
            throw new AppError(status.CONFLICT, "Roll number already exists. Try again.");
        }

        throw new AppError(status.BAD_REQUEST, "Student update failed");
    }

    return updatedStudent;
};

const studentDelete = async (studentId: string) => {
    const existingStudent = await prisma.student.findUnique({
        where: { id: studentId },
        include: { batchStudents: true, studentFees: true }
    });

    if (!existingStudent || existingStudent.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Student not found or already deleted");
    };

    try {
        await prisma.$transaction(async (tx) => {
            await tx.student.update({ where: { id: studentId }, data: { isDeleted: true } });

            await tx.studentFee.updateMany({
                where: { student:{
                    id:studentId
                } },
                data: { isDeleted: true }
            });

            await tx.batchStudent.updateMany({
                where: {
                    student: {
                        id: studentId
                    }
                },
                data: { isDeleted: true }
            });
            await tx.user.update({
                where: {
                    id:existingStudent.userId
                },
                data: {
                    isDeleted: true
                }
            })
        });
    } catch (error) {
        console.log(error)
        throw new AppError(status.BAD_REQUEST, "Student Update Failed")
    }
}

export const studentService = {
    createStudent,
    updateStudent,
    getAllStudent,
    getStudentById,
    studentDelete
}