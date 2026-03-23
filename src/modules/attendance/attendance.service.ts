import { prisma } from "../../database/prisma";
import { Attendance } from "../../generated/client";

const createAttendance = async (payload: Attendance) => {
    const { batchId, studentId, date, status, markBy, remarks } = payload;
    const startOfDay = new Date(date || new Date());
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date || new Date());
    endOfDay.setHours(23, 59, 59, 999);

    const isExistsAttendance = await prisma.attendance.findFirst({
        where: {
            studentId,
            batchId,
            date: {
                gte: startOfDay,
                lte: endOfDay
            },

            isDeleted: false
        },

    });
    if (isExistsAttendance) {
        throw new Error("Attendance already marked for today");
    };

    return await prisma.attendance.create({
   
        data: {
            batchId,
            studentId,
            date: date ? new Date(date) : new Date(),
            status,
            markBy,
            remarks,
        },

    })

};

const getAllAttendance = async (query: any) => {
  const { batchId, studentId } = query;

  const result = await prisma.attendance.findMany({
    where: {
      isDeleted: false,
      ...(batchId && { batchId }),
      ...(studentId && { studentId }),
    },
    include: {
      student: true,
      batch: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return result;
};

const updateAttendance = async (id: string, payload: any) => {
  const result = await prisma.attendance.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteAttendance = async (id: string) => {
  const result = await prisma.attendance.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  return result;
};

export const attendanceService = {
    createAttendance,
    getAllAttendance,
    updateAttendance,
    deleteAttendance
}