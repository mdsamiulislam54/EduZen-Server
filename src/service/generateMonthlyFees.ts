import { prisma } from "../database/prisma";

export const generateMonthlyFees = async () => {

    const students = await prisma.student.findMany({
        include: {
            batchStudents: {
                include: {
                    batch: {
                        select: {
                            id: true
                        }
                    }
                }
            }
        }
    });


    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    for (const student of students) {


        const batchId = student.batchStudents?.[0]?.batch?.id;

        if (!batchId) continue;
        const fee = await prisma.batchFee.findFirst({
            where: {
                batchId: batchId,
            },
        });

        if (!fee) continue;
        const existing = await prisma.studentFee.findFirst({
            where: {
                studentId: student.id,
                batchFeeId: fee.id,
            },
        });

        if (!existing) {
            await prisma.studentFee.create({
                data: {
                    studentId: student.id,
                    batchFeeId: fee.id,
                    amount: fee.amount,
                    paidAmount: 0,
                    dueAmount: fee.amount

                },
            });
        }
    }
};