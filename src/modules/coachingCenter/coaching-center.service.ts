import status from "http-status";
import { prisma } from "../../database/prisma"
import { AppError } from "../../shared/errors/app-error";
import { CoachingCenter, Role } from "../../generated/client";
import { auth } from "../../lib/auth";

import { generateRandomPassword } from "../../shared/utils/randomPasswordGenerate";

const createCoachingCenter = async (payload: CoachingCenter) => {
    const password = generateRandomPassword(8)
    const isExistingCenter = await prisma.coachingCenter.findUnique({
        where: { email: payload.email },
        select: { id: true }
    });
    if (isExistingCenter) {
        throw new AppError(status.CONFLICT, "Coaching center already exists");
    }
    const existingUser = await prisma.user.findUnique({
        where: { email: payload.email },
        select: { id: true }
    });
    if (existingUser) {
        throw new AppError(status.CONFLICT, "This email is already associated with an existing user");
    }

    const userData = await auth.api.signUpEmail({
        body: {
            name: payload.name,
            email: payload.email,
            password,
            needPasswordChange: true,
            role: Role.OWNER,
            teamPassword: password


        }
    });



    let coachingData;

    try {
        coachingData = await prisma.$transaction(async (tx) => {


            return await tx.coachingCenter.create({
                data: {
                    ...payload,
                    ownerId: userData.user.id
                },
                select: {
                    owner: true

                }
            })

        });
    } catch (error) {
        await prisma.user.delete({
            where: { id: userData?.user.id }
        });

        throw new AppError(status.BAD_REQUEST, "User Delete")
    }

    return coachingData
}

const getCoachingCenter = async () => {
    return await prisma.coachingCenter.findMany({
        where: {
            isDeleted: false
        }
    })
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

      return  await tx.user.update({
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

export const coachingCenterService = {
    createCoachingCenter,
    updateCoachingCenterById,
    getCoachingCenter,
    coachingCenterDeleteById
}