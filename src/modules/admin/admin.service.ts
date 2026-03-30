import status from "http-status";
import { prisma } from "../../database/prisma"
import { Role } from "../../generated/enums"
import { AppError } from "../../shared/errors/app-error";
import { format } from "date-fns";

const getAllOwners = async () => {
    const owners = await prisma.user.findMany({
        where: {
            role: Role.OWNER,
            isDeleted: false
        }
    });
    return owners
};

const getOwnerById = async (id: string) => {
    const isExistsOwner = await prisma.user.findUnique({
        where: {
            id,
            isDeleted: false
        }
    });

    if (!isExistsOwner) {
        throw new AppError(status.NOT_FOUND, "Owner not found this id")
    };

    return await prisma.user.findUnique({
        where: {
            id,
            isDeleted: false
        },
       include:{
        
        coachingCenter:true,
        
       }

    })
};

const deleteOwner = async (id: string) => {
    const isExistsOwner = await prisma.user.findUnique({
        where: {
            id,
            isDeleted: false
        }
    });

    if (!isExistsOwner) {
        throw new AppError(status.NOT_FOUND, "Owner not found this id")
    };

    return await prisma.user.update({
        where: { id },
        data: {
            isDeleted: true
        }
    });
};

const adminDashboardData = async () => {
    const [totalOwners, totalRevenue, activeSubscription, totalCoachingCenter,] = await Promise.all([
        prisma.user.count({ where: { role: Role.OWNER, isDeleted: false } }),
        prisma.payment.aggregate({ _sum: { amount: true } }),
        prisma.subscriptionPlan.count({ where: { isDeleted: false } }),
        prisma.coachingCenter.count({ where: { isDeleted: false } })

    ]);

    return {
        totalOwners,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeSubscription,
        totalCoachingCenter
    }
};

const adminAnalytics = async () => {
    const payments = await prisma.payment.findMany({
        select: {
            amount: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "asc"
        }
    });

    const grouped = payments.reduce((acc, payment) => {
        const day = format(payment.createdAt, "yyyy-MM-dd");
        if (!acc[day]) {
            acc[day] = {
                totalAmount: 0,
                count: 0
            }
        }
        acc[day].totalAmount += payment.amount
        acc[day].count += 1;

        return acc

    }, {} as Record<string, { totalAmount: number, count: number }>);

    const formatted = Object.entries(grouped).map(([date, data]) => ({
        date,
        totalAmount: data.totalAmount,
        count: data.count,
    }));

    return formatted

}


export const adminService = {
    getAllOwners,
    getOwnerById,
    deleteOwner,
    adminAnalytics,
    adminDashboardData
}