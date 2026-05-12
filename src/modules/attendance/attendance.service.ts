import status from "http-status";
import { prisma } from "../../database/prisma";
import { Attendance } from "../../generated/client";
import { AppError } from "../../shared/errors/app-error";
import { IQueryParams } from "../../types/query.type";
import { QueryBuilder } from "../../shared/utils/queryBuilder";

const createAttendance = async (payload: Attendance[], userId: string) => {

  if (!payload.length) return [];
  const date = payload[0].date || new Date()
  const startOfDay = new Date(date || new Date());
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date || new Date());
  endOfDay.setHours(23, 59, 59, 999);

  const studentsIds = payload.map(p => p.studentId)
  const isExistsAttendance = await prisma.attendance.findMany({
    where: {
      OR: payload.map(p => ({
        studentId: p.studentId,
        batchId: p.batchId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        isDeleted: false
      }))
    },
    select: {
      studentId: true,
      batchId: true
    }
  });

  const existingSet = new Set(
    isExistsAttendance.map(e => `${e.studentId}-${e.batchId}`)
  );
  const newData = payload.filter(
    p => !existingSet.has(`${p.studentId}-${p.batchId}`)
  );
  if (!newData.length) {
    throw new AppError(status.BAD_REQUEST, "All attendance already marked for today")
  }
  return await prisma.attendance.createMany({

    data: newData.map(p => ({
      batchId: p.batchId,
      studentId: p.studentId,
      date: p.date ? new Date(p.date) : new Date(),
      status: p.status,
      markBy: userId,
      remarks: p.remarks
    }))

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

const getStudentById = async (batchId: string, query: IQueryParams) => {

  const builder = new QueryBuilder({}, query)
    .paginate()
    .search(["name", "rollNumber"])


  const existingBatch = await prisma.batch.findFirst({
    where: {
      id: batchId
    }
  });

  if (!existingBatch) {
    throw new AppError(status.BAD_REQUEST, "Batch not found")
  }

  const allStudent = await prisma.student.findMany({
    where: {
      ...builder.query.where,
      batchStudents: {
        some: {

          batchId
        }
      }
    },

    select: {
      name: true,
      id: true,
      rollNumber: true
    }
  })

  const meta = await builder.getMeta(prisma.student)
  return {
    data: allStudent,
    meta: meta
  }
}

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

const getAttendanceByStudentId = async (studentId: string, query: IQueryParams) => {

  const builder = new QueryBuilder({}, query)
    .paginate()

  const result = await prisma.attendance.findMany({
    take: builder.limit,
    skip: builder.skip,
    where: {
      ...builder.query.where,
      isDeleted: false,
      studentId,
    },
    select: {
      status: true,
      date: true,
      studentId: true,
      batchId: true,

      student: {
        select: {
          name: true,
          image: true,
          rollNumber: true
        }
      },
      batch: {
        select: {
          batchName: true
        }
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const meta = await builder.getMeta(prisma.attendance)
  return {
    data: result,
    meta
  }
};

export const attendanceService = {
  createAttendance,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
  getStudentById,
  getAttendanceByStudentId
}