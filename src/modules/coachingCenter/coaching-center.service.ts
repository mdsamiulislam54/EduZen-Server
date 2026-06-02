import status from "http-status";
import { prisma } from "../../database/prisma"
import { AppError } from "../../shared/errors/app-error";
import { CoachingCenter, PaymentStatus, Role } from "../../generated/client";
import { auth } from "../../lib/auth";

import { generateRandomPassword } from "../../shared/utils/randomPasswordGenerate";
import { IStudentPaymentAction, PaymentMethod } from "./coaching-center.interface";


// const createCoachingCenter = async (payload: CoachingCenter) => {
//     const password = generateRandomPassword(8)
//     const isExistingCenter = await prisma.coachingCenter.findUnique({
//         where: { email: payload.email },
//         select: { id: true }
//     });
//     if (isExistingCenter) {
//         throw new AppError(status.CONFLICT, "Coaching center already exists");
//     }
//     const existingUser = await prisma.user.findUnique({
//         where: { email: payload.email },
//         select: { id: true }
//     });
//     if (existingUser) {
//         throw new AppError(status.CONFLICT, "This email is already associated with an existing user");
//     }

//     const userData = await auth.api.signUpEmail({
//         body: {
//             name: payload.name,
//             email: payload.email,
//             password,
//             needPasswordChange: true,
//             role: Role.OWNER,
//             teamPassword: password


//         }
//     });



//     let result;

//     try {
//         result = await prisma.$transaction(async (tx) => {


//             const center = await tx.coachingCenter.create({
//                 data: {
//                     ...payload,
//                     ownerId: userData.user.id
//                 },
//                 select: {
//                     id: true,
//                     owner: true

//                 }
//             });
//             const subscription = await tx.subscription.create({
//                 data: {
//                     coachingCenterId: center.id,
//                     subscriptionPlanId: "TRIAL_PLAN_ID",
//                     status: "TRIAL",
//                     startDate: new Date(),
//                     endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//                 },
//             });

//             return { center, subscription }
//         });
//     } catch (error) {
//         await prisma.user.delete({
//             where: { id: userData?.user.id }
//         });

//         throw new AppError(status.BAD_REQUEST, "User Delete")
//     }

//     return result
// }

const getCoachingCenter = async () => {
    return await prisma.coachingCenter.findMany({
        where: {
            isDeleted: false
        },

    })
}

const getCoachingOwnerDashboardData = async (ownerId: string) => {
    const coachingCenter = await prisma.coachingCenter.findFirst({
        where: {
            ownerId,
            isDeleted: false
        },
    });

    if (!coachingCenter) {
        throw new AppError(status.NOT_FOUND, "Coaching center not found for the owner");
    }

    const [totalStudents, totalBatches, totalRevenue, totalTeachers, totalSubjects] = await Promise.all([
        prisma.student.count({
            where: {
                coachingCenterId: coachingCenter.id,
                isDeleted: false
            }
        }),
        prisma.batch.count({
            where: {
                coachingCenterId: coachingCenter.id,
                isDeleted: false
            }
        }),
        prisma.studentFee.aggregate({
            where: {
                paymentStatus: {
                    in: ["PAID", "PARTIAL"]
                },
                isDeleted: false
            },
            _sum: {
                paidAmount: true
            }
        }),
        prisma.teacher.count({
            where: {
                coachingCenterId: coachingCenter.id,
                isDeleted: false
            }
        }),
        prisma.subject.count({
            where: {
                coachingCenterId: coachingCenter.id,
                isDeleted: false
            }
        })

    ]);

    return {
        totalStudents,
        totalBatches,
        totalRevenue: totalRevenue._sum.paidAmount || 0,
        totalTeachers, totalSubjects
    };
}

const updateCoachingCenterById = async (payload: Partial<CoachingCenter>, id: string) => {
    const coachingCenter = await prisma.coachingCenter.findUnique({
        where: { id }
    });

    if (!coachingCenter) {
        throw new AppError(status.NOT_FOUND, "Coaching center not found by id")
    }

    const result = await prisma.coachingCenter.update({
        where: {
            id
        },
        data: {
            ...payload
        }
    });

    return result
}
const coachingCenterDeleteById = async (id: string) => {
    const coachingCenter = await prisma.coachingCenter.findUnique({
        where: { id }
    });

    if (!coachingCenter) {
        throw new AppError(status.NOT_FOUND, "Coaching center not found by id")
    }

    const result = await prisma.$transaction(async (tx) => {
        const coachingData = await tx.coachingCenter.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            },
            select: {
                email: true
            }
        })

        return await tx.user.update({
            where: {
                email: coachingData.email
            },
            data: {
                isDeleted: true
            }
        })


    });

    return result
}

const coachingCenterOwnerDashboardStudentGrowth = async (ownerId: string) => {
    const coachingCenter = await prisma.coachingCenter.findFirst({
        where: {
            ownerId
        },
        select: { id: true },
    });

    if (!coachingCenter) {
        throw new AppError(status.NOT_FOUND, "Coaching center not found");
    }

    const studentGrowthData = await prisma.student.findMany({
        where: {
            coachingCenterId: coachingCenter.id,
            isDeleted: false,
        },
        select: {
            createdAt: true,
            studentFees: {
                where: { isDeleted: false },
                select: { amount: true },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    const grouped: Record<string, { date: string; count: number; totalFee: number }> = {};

    for (const student of studentGrowthData) {
        const date = student.createdAt.toISOString().split("T")[0];

        const totalFee = student.studentFees.reduce(
            (sum, fee) => sum + (fee.amount || 0),
            0
        );

        if (!grouped[date]) {
            grouped[date] = {
                date,
                count: 0,
                totalFee: 0,
            };
        }

        grouped[date].count += 1;
        grouped[date].totalFee += totalFee;
    }

    return Object.values(grouped);
};


const findStudentByRollNumber = async (rollNumber: string) => {
    const student = await prisma.student.findFirst({
        where: {
            rollNumber
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    image: true,
                    id: true,

                }
            },
            studentFees: {
                select: {
                    id: true,
                    amount: true,
                    paidAmount: true,
                    dueAmount: true,
                    paymentStatus: true,
                    paymentMethod: true,
                    batchFee: true,
                    studentId: true,
                    batchFeeId: true,

                }
            },

        }
    });

    if (!student) {
        throw new AppError(status.NOT_FOUND, "Student not found");
    }

    return student;
};

const payStudentFee = async (payload: IStudentPaymentAction) => {
    const { studentId, fees,  paymentMethod } = payload

    console.log("PAYLOAD:", payload)

    const student = await prisma.student.findUnique({
        where: { id: studentId },
    })

    console.log("STUDENT:", student)
    
    if (!student) { 
        throw new AppError(status.NOT_FOUND, "Student not found")           
    }

    const result = await prisma.$transaction(async (tx) => {
        const responses = []

        for (const fee of fees) {
            console.log("Processing fee:", fee)

            const existing = await tx.studentFee.findFirst({
                where: {
                    studentId,
                    batchFeeId: fee.batchFeeId,
                },
            })

            console.log("EXISTING:", existing)

            // ✅ UPDATE CASE
            if (existing) {
                const newPaid = Number(existing.paidAmount + fee.paidAmount)
                const newDue = Number(existing.amount - newPaid)

                console.log("newPaid:", newPaid)
                console.log("newDue:", newDue)

                if (newDue <= 0) {
                    throw new AppError(
                        status.BAD_REQUEST,
                        "Paid amount exceeds total"
                    )
                }

                let paymentStatus: PaymentStatus = "PENDING"
                if (newDue === 0) paymentStatus = "PAID"
                else if (newPaid >= 0) paymentStatus = "PARTIAL"

                const updated = await tx.studentFee.update({
                    where: { id: existing.id },
                    data: {
                        paidAmount: newPaid,
                        dueAmount: newDue,
                        paymentMethod,
                        paymentStatus,
                    },
                })

                console.log("UPDATED:", updated)

                responses.push(updated)
                continue
            }

            // ✅ CREATE CASE
            const dueAmount = Number(fee.amount - (fee.paidAmount || 0))

            console.log("dueAmount:", dueAmount)

            const created = await tx.studentFee.create({
                data: {
                    studentId,
                    batchFeeId: fee.batchFeeId,
                    amount: Number(fee.amount),
                    paidAmount: Number(fee.paidAmount || 0),
                    dueAmount: Number(dueAmount),
                    paymentMethod,
                    paymentStatus: Number(dueAmount) === 0 ? "PAID" : "PARTIAL",
                },
            })

            console.log("CREATED:", created)

            responses.push(created)
        }

        return responses
    })

    console.log("FINAL RESULT:", result)

    return result
}
const getOwnSubscriptions = async (ownerId: string) => {
    const coachingCenter = await prisma.coachingCenter.findFirst({
        where: { ownerId },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });

    if (!coachingCenter) {
        throw new AppError(status.BAD_REQUEST, "CoachingCenter Not Found");
    }

    const subscription = await prisma.subscription.findFirst({
        where: {
            coachingCenterId: coachingCenter.id,
        },
        include: {
            subscriptionPlan: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    features: true,
                },
            },
        },
    });

    if (!subscription) {
        return {
            coachingCenter,
            subscription: null,
        };
    }

    return {
        coachingCenter,
        subscription: {
            id: subscription.id,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate,

            plan: {
                id: subscription.subscriptionPlan.id,
                name: subscription.subscriptionPlan.name,
                price: subscription.subscriptionPlan.price,
                features: subscription.subscriptionPlan.features,
            },
        },
    };
};

export const coachingCenterService = {
    // createCoachingCenter,
    updateCoachingCenterById,
    getCoachingCenter,
    coachingCenterDeleteById,
    getCoachingOwnerDashboardData,
    coachingCenterOwnerDashboardStudentGrowth,
    findStudentByRollNumber,
    getOwnSubscriptions,
    payStudentFee
}