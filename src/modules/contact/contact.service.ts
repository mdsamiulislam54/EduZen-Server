import status from "http-status";
import { prisma } from "../../database/prisma";
import { AppError } from "../../shared/errors/app-error";
import { ContactMessage } from "./cntact.interface"
import { IQueryParams } from "../../types/query.type";
import { QueryBuilder } from "../../shared/utils/queryBuilder";


const createContactMessage = async (payload: ContactMessage) => {
    const isExistsContactMessage = await prisma.contactMessage.findFirst({
        where: {
            email: payload.email.trim().toLowerCase(),
            message: payload.message,
            subject: payload.subject,
        }
    });

    if (isExistsContactMessage) {
        throw new AppError(status.CONFLICT, "Duplicate contact message detected");
    }

    const contactMessage = await prisma.contactMessage.create({
        data: {
            ...payload
        }
    });

    return contactMessage;
};

const getAllContactMessages = async (query: IQueryParams) => {
    const builder = new QueryBuilder({}, query);
    builder.search(["fullName", "email", "message", "subject"]);
    builder.filter();
    builder.sort();
    builder.paginate();
    const contactMessages = await prisma.contactMessage.findMany({
        take: builder.limit,
        skip: builder.skip,
        where: builder.query,
        orderBy: {
            createdAt: "desc"
        }
    });

    const meta = await builder.getMeta(prisma.contactMessage);

    return { data: contactMessages, meta };
};

export const contactService = {
    createContactMessage,
    getAllContactMessages
}