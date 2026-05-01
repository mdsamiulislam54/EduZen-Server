import status from "http-status";
import { prisma } from "../../database/prisma";
import { Subject } from "../../generated/client";
import { AppError } from "../../shared/errors/app-error";
import { QueryBuilder } from "../../shared/utils/queryBuilder";
import { IQueryParams } from "../../types/query.type";

const createSubject = async (payload: Subject, ownerId: string) => {
    const coachingCenterId = await prisma.coachingCenter.findFirst({
        where: {
            ownerId
        },
        select: {
            id: true
        }

    })

    if (!coachingCenterId) {
        throw new AppError(status.NOT_FOUND, "coaching center not found")
    };

    const result = await prisma.subject.create({
        data: {
            ...payload,
            coachingCenterId: coachingCenterId.id
        }
    });

    return result
};

const getAllSubject = async (query: IQueryParams) => {
    const builder = new QueryBuilder({}, query)
        .search(["name"])
        .filter()
        .paginate()
        .sort()
    const data = await prisma.subject.findMany(builder.query)
    const meta = await builder.getMeta(prisma.subject)

    return{
        data,
        meta
    }
}
const getSubjectById = async (id: string) => {
    const isExistSubject = await prisma.subject.findUnique({ where: { id } });
    if (!isExistSubject) {
        throw new AppError(status.BAD_REQUEST, "Subject is not found")
    };

    return await prisma.subject.findUnique({
        where: {
            id
        },


    })
}
const subjectUpdateById = async (payload: Partial<Subject>, id: string) => {
    const isExistSubject = await prisma.subject.findUnique({ where: { id } });
    if (!isExistSubject) {
        throw new AppError(status.BAD_REQUEST, "Subject is not found")
    };

    return await prisma.subject.update({
        where: {
            id
        },
        data: {
            ...payload
        }
    })
}
const deleteSubjectById = async (id: string) => {
    const isExistSubject = await prisma.subject.findUnique({ where: { id } });
    if (!isExistSubject) {
        throw new AppError(status.BAD_REQUEST, "Subject is not found")
    };

    return await prisma.subject.delete({
        where: {
            id
        }
    })
}

export const subjectService = {
    createSubject,
    getAllSubject,
    getSubjectById,
    deleteSubjectById,
    subjectUpdateById
}