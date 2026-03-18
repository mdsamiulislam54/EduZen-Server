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
    console.log(".............existing Center......", isExistingCenter)
    if (isExistingCenter) {
        throw new AppError(status.CONFLICT, "Coaching center already exists");
    }
    const existingUser = await prisma.user.findUnique({
        where: { email: payload.email },
        select: { id: true }
    });
    console.log("............userExisting........", existingUser)
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
            teamPassword:password


        }
    });

    console.log(".............user.........", userData)

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

export const coachingCenterService = {
    createCoachingCenter
}