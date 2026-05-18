import status from "http-status";
import { prisma } from "../../database/prisma";
import { Role, Student } from "../../generated/client";
import { AppError } from "../../shared/errors/app-error";
import { generateRandomPassword } from "../../shared/utils/randomPasswordGenerate";
import { auth } from "../../lib/auth";
import { ICreateStudent, IStudentUpdate } from "./student.interface";
import { generateRollNumber } from "./utils";
import ApiError from "../../shared/errors/api-error";
import { QueryBuilder } from "../../shared/utils/queryBuilder";
import { IQueryParams } from "../../types/query.type";
import { uuidv7 } from "zod";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe";
import { ICheckoutPayload } from "../SubscriptionPlan/subscriptionPlan.interface";



const createStudent = async (payload: ICreateStudent, userId: string) => {

    const { batchId, studentData } = payload;
    const password = generateRandomPassword(8)
    const isExistingStudent = await prisma.student.findUnique({
        where: { email: studentData.email },
        select: { id: true }
    });
    if (isExistingStudent) {
        throw new AppError(status.CONFLICT, "Student  already exists");
    };
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            coachingCenter: {
                select: {
                    id: true
                }
            }
        }
    });
    if (!user) {
        throw new AppError(status.BAD_REQUEST, "User Not Found")
    }
    const coachingCenterId = user?.coachingCenter?.id as string
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


    let student;

    try {
        student = await prisma.$transaction(async (tx) => {

            const s = await tx.student.create({
                data: {
                    ...studentData,
                    image: typeof studentData.image === "string" ? studentData.image : undefined,
                    coachingCenterId,
                    userId: userData.user.id,
                    rollNumber: generateRollNumber()
                },
                select: {
                    id: true,
                    user: true

                }
            });


            const batchStudentData = batchId.map((batch) => ({
                batchId: batch,
                studentId: s.id
            }))

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

        return {
            message: "Student created successfully",
            success: true,

        }
    } catch (error) {
        await prisma.user.delete({
            where: { id: userData?.user.id }
        });

        throw new AppError(status.BAD_REQUEST, "User Delete")
    }

}

const getAllStudent = async (id: string, query: IQueryParams) => {


    if (!id) {
        throw new AppError(status.BAD_REQUEST, "Owner ID is required")
    }


    const builder = new QueryBuilder({}, query)
        .search(["name", "phone", "rollNumber", "id"])
        .filter()
        .paginate()
        .sort();
    const data = await prisma.student.findMany({
        take: builder.limit,
        skip: builder.skip,
        where: {
            ...builder.query.where,
            isDeleted: false,

        },
        include: {
            batchStudents: {
                select: {
                    batch: {
                        select: {
                            id: true,

                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }

    })
    const meta = await builder.getMeta(prisma.student)

    return {
        data,
        meta
    }
}
const getStudentById = async (id: string) => {
    const isExistStudent = prisma.student.findUnique({ where: { id, isDeleted: false } });
    if (!isExistStudent) {
        throw new ApiError(status.BAD_REQUEST, "Student not found by id")
    }
    return await prisma.student.findFirst({
        where: {
            isDeleted: false,
            id
        },
        include: {
            attendances: true,
            batchStudents: {
                include: {
                    batch: {
                        select: {
                            batchName: true,
                            id: true,
                            status: true,

                        }
                    }
                }
            },
            coachingCenter: true,
            marks: true,
            results: true,
            studentFees: true,
            user: true
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
                    image: typeof studentData.image === "string" ? studentData.image : undefined,

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
                where: {
                    student: {
                        id: studentId
                    }
                },
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
                    id: existingStudent.userId
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
};

const getStudentResultById = async (id: string) => {

}

const studentDashboardCard = async (studentId: string) => {
    const student = await prisma.student.findUnique({
        where: {
            userId: studentId,
        },
        include: {
            studentFees: true,
            results: true,
            attendances: true,
            batchStudents: {
                include: {
                    batch: true,
                },
            },
        },
    });

    if (!student) {
        throw new AppError(status.BAD_REQUEST, "Student Not Found")
    }


    const totalFee = student.studentFees.reduce((sum, fee) =>
        sum + (fee.amount || 0)
        , 0
    )

    const paidFee = student.studentFees.reduce(
        (sum, fee) => sum + (fee.paidAmount || 0),
        0
    );
    const dueFee = totalFee - paidFee;

    const totalMarks = student.results.reduce(
        (sum, r) => sum + (r.mark || 0),
        0
    );

    const avgMarks = student.results.length
        ? totalMarks / student.results.length
        : 0;

    const totalAttendance = student.attendances.length;

    const present = student.attendances.filter(
        (a) => a.status === "PRESENT"
    ).length;

    const attendancePercent = totalAttendance
        ? (present / totalAttendance) * 100
        : 0;

    const totalBatch = student.batchStudents.length;
    return {

        profile: {
            name: student.name,
            roll: student.rollNumber,
            status: student.status,
            image: student.image ?? null
        },

        performance: {
            totalExams: student.results.length || 0,
            totalMarks,
            avgMarks,
        },

        attendance: {
            total: totalAttendance,
            present,
            percent: attendancePercent.toFixed(2),
        },

        fees: {
            totalFee,
            paidFee,
            dueFee,
        },

        batches: student.batchStudents.map((b) => ({
            id: b.id,
            name: b.batch?.batchName,
            total: totalBatch
        })),
    };

}

const studentClassSchedule = async (studentId: string) => {
    const student = await prisma.student.findUnique({
        where: { userId: studentId },
        select: {
            batchStudents: {
                select: {
                    batch: {
                        select: {
                            id: true,
                            batchName: true,
                            startTime: true,
                            endTime: true,
                            daysOfWeek: true,
                            batchTeachers: {
                                select: {
                                    teacher: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!student) {
        throw new AppError(status.NOT_FOUND, "Student not found");
    }

    const today = new Date();
    const dayName = today
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase();

    const schedules: any[] = [];

    for (const b of student.batchStudents) {
        const batch = b.batch;

        const days = Array.isArray(batch.daysOfWeek)
            ? (batch.daysOfWeek as string[])
            : [];

        const isToday = days.includes(dayName);

        if (!isToday) continue;

        schedules.push({
            batchId: batch.id,
            batchName: batch.batchName,
            startTime: batch.startTime,
            endTime: batch.endTime,
            teacherName:
                batch.batchTeachers?.[0]?.teacher?.name || "N/A",
            day: dayName,
        });
    }

    return schedules;
};

const studentFee = async (userId: string) => {

    const student = await prisma.student.findFirst({
        where: {
            userId,
        },
    });

    if (!student) {
        throw new AppError(status.BAD_REQUEST, "Student not found");
    }

    const fee = await prisma.studentFee.findFirst({
        where: {
            studentId: student.id,
        },

        include: {
            student: {
                select: {
                    name: true,
                    rollNumber: true,
                    email: true,
                    image: true,
                    phone: true,
                    batchStudents: {
                        select: {
                            batch: {
                                select: {
                                    batchName: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!fee) {
        throw new AppError(status.BAD_REQUEST, "Fee not found");
    }

    const dueAmount = fee.amount - fee.paidAmount;

    // CLEAN RESPONSE OBJECT
    return {
        feeId: fee.id,
        studentId: fee.studentId,

        student: {
            name: fee.student.name,
            rollNumber: fee.student.rollNumber,
            email: fee.student.email,
            phone: fee.student.phone,
            image: fee.student.image,
            batchName:
                fee.student.batchStudents?.[0]?.batch?.batchName || null,
        },

        fee: {
            totalAmount: fee.amount,
            paidAmount: fee.paidAmount,
            dueAmount,
            status: fee.paymentStatus,
        },
    };
};

const subscriptionBuy = async (payload: ICheckoutPayload, userId: string) => {

    console.log(payload)
    const plan = await prisma.subscriptionPlan.findUnique({
        where: {
            id: payload.subscriptionId
        }
    });
    if (!plan) {
        throw new AppError(status.BAD_REQUEST, "Plan not found")
    }
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            coachingCenter: {
                select: {
                    id: true
                }
            }
        }
    });

    const coachingCenterId = user?.coachingCenter?.id;
    if (!coachingCenterId) {
        throw new AppError(status.BAD_REQUEST, "User not found")
    }
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [{
            price_data: {
                currency: "bdt",
                product_data: {
                    name: plan.name,
                },
                unit_amount: plan.price * 100,

            },

            quantity: 1

        }],

        success_url: `${envVars.FRONTEND_URL}/payment/success`,
        cancel_url: `${envVars.FRONTEND_URL}/payment/cancel`,
        metadata: {
            type: "subscription",
            coachingCenterId,
            subscriptionPlanId: plan.id,
        }
    });

    await prisma.$transaction(async (tx) => {

        const existing = await tx.subscriptionPayment.findFirst({
            where: {
                stripeSessionId: session.id,
            },
        });

        if (existing) return existing;


        await tx.subscriptionPayment.upsert({
            where: {
                stripeSessionId: session.id
            },
            update: {
                status: "PENDING"
            },
            create: {
                coachingCenterId,
                subscriptionPlanId: plan.id,
                amount: plan.price,
                transactionId: String(uuidv7()),
                stripeSessionId: session.id,
                startDate: new Date(),
                endDate: new Date(),
                status: "PENDING",
            },
        });
        const existingSubscription = await tx.subscription.findFirst({
            where: {
                coachingCenterId,
            },
        });

        if (existingSubscription) {
            await tx.subscription.update({
                where: {
                    id: existingSubscription.id,
                },
                data: {
                    subscriptionPlanId: plan.id,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    status: "ACTIVE",
                },
            });
        } else {
            await tx.subscription.create({
                data: {
                    coachingCenterId,
                    subscriptionPlanId: plan.id,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    status: "TRIAL",
                },
            });
        }
    })

    return {
        checkoutUrl: session.url
    };
}

export const studentService = {
    createStudent,
    updateStudent,
    getAllStudent,
    getStudentById,
    studentDelete,
    studentDashboardCard,
    studentClassSchedule,
    studentFee
}