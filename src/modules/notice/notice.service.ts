// notice.service.ts
import status from "http-status";

import { ICreateNotice, IUpdateNotice, } from "./notice.interface";
import { prisma } from "../../database/prisma";
import { AppError } from "../../shared/errors/app-error";
import { QueryBuilder } from "../../shared/utils/queryBuilder";
import { IQueryParams } from "../../types/query.type";

const createNotice = async (payload: ICreateNotice, userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },

        select: {
            coachingCenter: {
                select: {
                    id: true,
                },
            },
        },
    });

    if (!user?.coachingCenter?.id) {
        throw new AppError(status.NOT_FOUND, "Coaching center not found");
    }

    const notice = await prisma.notice.create({
        data: {
            ...payload,
            coachingCenterId: user.coachingCenter.id,
        },
    });

    return notice
};

const getAllNotice = async (userId: string, query: IQueryParams) => {

    const builder = new QueryBuilder({}, query)
        .paginate()
        .search(["title"])

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },

        select: {
            coachingCenter: {
                select: {
                    id: true,
                },
            },

            students: {
                select: {
                    coachingCenterId: true
                }
            },
            teacher: {
                select: {
                    coachingCenterId: true,
                },
            },
        },
    });

    const coachingCenterId =
        user?.coachingCenter?.id ||
        user?.students?.coachingCenterId ||
        user?.teacher?.coachingCenterId;

    console.log(user, userId)

    if (!coachingCenterId) {
        throw new AppError(status.NOT_FOUND, "Coaching center not found");
    }

    const notices = await prisma.notice.findMany({
        take: builder.limit,
        skip: builder.skip,
        where: {
            ...builder.query.where,
            coachingCenterId,
            isDeleted: false,
            isPublished: true,
        },

        orderBy: [
            {
                isPinned: "desc",
            },
            {
                createdAt: "desc",
            },
        ],
    });

    const meta = await builder.getMeta(prisma.notice);

    return {
        data: notices,
        meta
    }


};

const getNoticeById = async (id: string, userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },

        select: {
            coachingCenter: {
                select: {
                    id: true,
                },
            },
        },
    });

    if (!user?.coachingCenter?.id) {
        throw new AppError(status.NOT_FOUND, "Coaching center not found");
    }
    const notice = await prisma.notice.findFirst({
        where: {
            coachingCenterId: user.coachingCenter.id,
            id,
            isDeleted: false,
        },
    });

    if (!notice) {
        throw new AppError(status.NOT_FOUND, "Notice not found");
    }

    return notice
};


const updateNotice = async (id: string, payload: Partial<IUpdateNotice>, userId: string) => {

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },

        select: {
            coachingCenter: {
                select: {
                    id: true,
                },
            },
        },
    });

    if (!user?.coachingCenter?.id) {
        throw new AppError(status.NOT_FOUND, "Coaching center not found");
    }
    const isExist = await prisma.notice.findFirst({
        where: {
            coachingCenterId: user.coachingCenter.id,
            id,
            isDeleted: false,
        },
    });

    if (!isExist) {
        throw new AppError(status.NOT_FOUND, "Notice not found");
    }

    const updatedNotice = await prisma.notice.update({
        where: {
            coachingCenterId: user.coachingCenter.id,
            id,
        },
        data: payload,
    });

    return {
        success: true,
        message: "Notice updated successfully",
        data: updatedNotice,
    };
};




const deleteNotice = async (id: string, userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },

        select: {
            coachingCenter: {
                select: {
                    id: true,
                },
            },
        },
    });

    if (!user?.coachingCenter?.id) {
        throw new AppError(status.NOT_FOUND, "Coaching center not found");
    }
    const isExist = await prisma.notice.findFirst({
        where: {
            coachingCenterId: user.coachingCenter.id,
            id,
            isDeleted: false,
        },
    });

    if (!isExist) {
        throw new AppError(status.NOT_FOUND, "Notice not found");
    }

    await prisma.notice.update({
        where: {
            coachingCenterId: user.coachingCenter.id,
            id,
        },
        data: {
            isDeleted: true,
        },
    });

    return {
        success: true,
        message: "Notice deleted successfully",
    };
};


export const NoticeService = {
    createNotice,
    getAllNotice,
    getNoticeById,
    updateNotice,
    deleteNotice,
};