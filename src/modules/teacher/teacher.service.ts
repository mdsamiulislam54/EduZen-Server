import status from "http-status";
import { prisma } from "../../database/prisma";
import { AppError } from "../../shared/errors/app-error";
import { ITeacher, ITeacherUpdate } from "./teacher.interface"
import { auth } from "../../lib/auth";
import { generateRandomPassword } from "../../shared/utils/randomPasswordGenerate";
import { Role } from "../../generated/enums";

const createTeacher = async (payload: ITeacher, userId: string) => {
    const { subjectIds, teacherData } = payload;
    const isexistsTeacher = await prisma.teacher.findUnique({ where: { email: teacherData.email } });
    if (isexistsTeacher) {
        throw new AppError(status.CONFLICT, "This teacher already exist")
    };

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            coachingCenter: {
                select: {
                    id: true
                }
            }
        }
    });
    if (!user) {
        throw new AppError(status.BAD_REQUEST, "User Not Found")
    }
    const coachingCenterId = user?.coachingCenter?.id as string
    const password = generateRandomPassword()
    const userData = await auth.api.signUpEmail({
        body: {
            email: teacherData.email,
            name: teacherData.name,
            role: Role.TEACHER,
            password,
            teamPassword: password,
            needPasswordChange: true,
            image: teacherData.image

        }
    })
    let teacher;
    try {
        teacher = await prisma.$transaction(async (tx) => {
            const createTeacher = await tx.teacher.create({
                data: {
                    ...teacherData,
                    coachingCenterId,
                    userId: userData?.user?.id
                }
            });
            const subjectData = subjectIds.map((subId) => ({
                teacherId: createTeacher.id,
                subjectId: subId
            }));

            await tx.teacherSubject.createMany({
                data: subjectData
            })

        })
    } catch (error) {
        console.log(error)
        await prisma.user.delete({
            where: { id: userData?.user.id }
        });

        throw new AppError(status.BAD_REQUEST, "User Delete")
    }

    return teacher
}

const updateTeacher = async (payload: Partial<ITeacherUpdate>, teacherId: string) => {
    const isExistsTeacher = await prisma.teacher.findUnique({
        where: {
            id: teacherId,
        },
        include: {
            teacherSubjects: true,
            user: true,


        }
    });

    if (!isExistsTeacher) {
        throw new AppError(status.BAD_REQUEST, "Teacher not found By Id");
    }

    let updateTeacher;
    try {
        updateTeacher = await prisma.$transaction(async (tx) => {
            await tx.teacher.update({
                where: {
                    id: teacherId
                },
                data: {
                    ...payload.teacherData
                }
            });
            if (payload.teacherData?.name || payload.teacherData?.email) {
                await tx.user.update({
                    where: { id: isExistsTeacher.user.id },
                    data: {
                        name: payload.teacherData.name ?? isExistsTeacher.user.name,
                        email: payload.teacherData.email ?? isExistsTeacher.user.email
                    }
                });
            }

            if (payload.subjectIds) {
                await tx.teacherSubject.deleteMany({
                    where: { teacherId }
                })
            }
            if (payload.subjectIds && payload.subjectIds.length > 0) {
                const newSubjects = payload?.subjectIds.map((subId) => ({
                    teacherId,
                    subjectId: subId
                }));

                if (newSubjects.length > 0) {
                    await tx.teacherSubject.createMany({
                        data: newSubjects
                    });
                }
            }
        })
    } catch (error) {
        console.log(error);
        throw new AppError(status.BAD_REQUEST, "Teacher update failed")
    }

    return updateTeacher
}

const getAllTeacher = async () => {
    return await prisma.teacher.findMany({
        where: {
            isDeleted: false
        }
    })
}
const getAllTeacherById = async (id:string) => {
    return await prisma.teacher.findFirst({
        where: {
            id,
            isDeleted: false
        },
        include:{
            coachingCenter:true,
            teacherSubjects:true,
            user:true
        }
    })
}

const deleteTeacher = async (teacherId: string) => {
    const isExistingTeacher = await prisma.teacher.findUnique({
        where: {
            id: teacherId
        }
    });

    const result = await prisma.$transaction(async (tx) => {
        const teacher = await tx.teacher.update({
            where: { id: teacherId },
            data: { isDeleted: true },
        });

        await tx.user.update({
            where: {
                id: isExistingTeacher?.userId
            },
            data: {
                isDeleted: true
            }
        });
        await tx.teacherSubject.updateMany({
            where: { id: teacherId },
            data: {
                teacherId
            }
        });

        return teacher

    })

    return result
}

export const teacherService = {
    createTeacher,
    getAllTeacher,
    updateTeacher,
    deleteTeacher,
    getAllTeacherById
}