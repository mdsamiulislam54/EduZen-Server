import status from "http-status";
import { prisma } from "../../database/prisma";
import ApiError from "../../shared/errors/api-error";
import { IBatchUpdatePayload, ICreateBatchPayload } from "./batch.interface";

const createBatch = async (payload: ICreateBatchPayload, ownerId: string) => {
    const { amount, feeType, batchData } = payload;
    const coachingCenterId = await prisma.coachingCenter.findUnique({
        where: {
            ownerId
        },
        select: {
            id: true
        }
    })
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

        return await tx.batchFee.create({
            data: {
                amount,
                feeType,
                batchId: batch.id
            },
            select: {
                batch: true
            }
        })
    })

    return result
}

const getAllBatch = async () => {
    return await prisma.batch.findMany({
        where: {
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
    const result = prisma.$transaction(async (tx) => {
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
        const updateBatchFee = await tx.batchFee.update({
            where: {
                id: feeId,
            },
            data: {
                amount,
                feeType
            }
        })

        return {
            batch,
            batchFee:updateBatchFee
        }
    })

    return result
}

const batchDeleteById = async (id: string) => {
    const isExistBatch = prisma.batch.findUnique({ where: { id, isDeleted: false } });
    if (!isExistBatch) {
        throw new ApiError(status.BAD_REQUEST, "Batch not found by id")
    };
    return await prisma.batch.update({
        where: { id, isDeleted: false },
        data: { isDeleted: true }
    })
}




export const batchService = {
    createBatch,
    getAllBatch,
    getBatchById,
    batchUpdateById,
    batchDeleteById
}