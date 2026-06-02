import status from "http-status";
import { prisma } from "../../database/prisma";
import ApiError from "../../shared/errors/api-error";
import { IBatchUpdatePayload, ICreateBatchPayload } from "./batch.interface";
import { QueryBuilder } from "../../shared/utils/queryBuilder";
import { IQueryParams } from "../../types/query.type";

const createBatch = async (payload: ICreateBatchPayload, ownerId: string) => {
    const { amount, feeType, teacherIds, batchData } = payload;
    const coachingCenterId = await prisma.coachingCenter.findUnique({
        where: {
            ownerId
        },
        select: {
            id: true
        }
    })
    const start = new Date(batchData.startTime)
    const end = new Date(batchData.endTime)

    const startTime = start.getHours() * 60 + start.getMinutes();
    const endTime = end.getHours() * 60 + end.getMinutes();
    
    console.log(startTime, endTime)
    if (startTime >= endTime) {
        throw new ApiError(status.BAD_REQUEST, "Start time must be before end time")
    }
    const result = await prisma.$transaction(async (tx) => {
        const batch = await tx.batch.create({
            data: {
                ...batchData,
                coachingCenterId: coachingCenterId?.id as string
            },
            select: {
                id: true
            }
        });

        await tx.batchFee.create({
            data: {
                amount,
                feeType,
                batchId: batch.id
            },
            select: {
                batch: true
            }
        });

        if (teacherIds) {
            const teacherData = teacherIds.map((id) => ({
                batchId: batch.id,
                teacherId: id
            }));

            await tx.batchTeachers.createMany({
                data: teacherData
            })


        }


    })

    return result
}

const getAllBatch = async (query: IQueryParams) => {
    const builder = new QueryBuilder({}, query)
        .search(["batchName", "batchCode"])
        .filter()
        .paginate()
        .sort()
    const data = await prisma.batch.findMany({
        take: builder.limit,
        skip: builder.skip,
        where: {
            ...builder.query.where,
            isDeleted: false
        },
        include: {
            batchFee: {
                select: {
                    amount: true,
                    feeType: true
                }
            },
            batchTeachers: true
        },
        orderBy: { createdAt: "desc" }
    })

    const meta = await builder.getMeta(prisma.batch)

    return {
        data,
        meta
    }
}
const getBatchById = async (id: string) => {
    const isExistBatch = prisma.batch.findUnique({ where: { id, isDeleted: false } });
    if (!isExistBatch) {
        throw new ApiError(status.BAD_REQUEST, "Batch not found by id")
    }
    return await prisma.batch.findMany({
        where: {
            id,
            isDeleted: false
        },
        include: {
            attendances: true,
            batchFee: true,
            batchStudents: true,
            coachingCenter: true,
            exams: true
        }
    })
}

const batchUpdateById = async (payload: Partial<IBatchUpdatePayload>, id: string) => {
    const { amount, feeType, batchData } = payload;
    const isExistBatch = prisma.batch.findUnique({ where: { id, isDeleted: false } });
    if (!isExistBatch) {
        throw new ApiError(status.BAD_REQUEST, "Batch not found by id")
    }
    prisma.$transaction(async (tx) => {
        const batch = await tx.batch.update({
            where: {
                id,
            },
            data: {
                ...batchData
            },
            include: {
                batchFee: {
                    select: {
                        id: true
                    }
                }
            }

        })
        const feeId = batch.batchFee[0]?.id;

        if (!feeId) {
            throw new Error("Batch fee not found");
        }
        await tx.batchFee.update({
            where: {
                id: feeId,
            },
            data: {
                amount,
                feeType
            }
        })


    })

    return {
        success: true,
        message: "Batch Update Successfully!"
    }
}

const batchDeleteById = async (id: string) => {
    const isExistBatch = prisma.batch.findUnique({ where: { id, isDeleted: false } });
    if (!isExistBatch) {
        throw new ApiError(status.BAD_REQUEST, "Batch not found by id")
    };
    await prisma.batch.update({
        where: { id, isDeleted: false },
        data: { isDeleted: true }
    });

    return {
        success: true,
        message: "Batch Delete Successfully!"
    }
}




export const batchService = {
    createBatch,
    getAllBatch,
    getBatchById,
    batchUpdateById,
    batchDeleteById
}