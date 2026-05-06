import status from "http-status";
import { prisma } from "../../database/prisma";
import { Mark } from "../../generated/client";
import { AppError } from "../../shared/errors/app-error";
import { calculateGrade } from "./utils";
import { IMarkCreate } from "./mark.interface";
import { QueryBuilder } from "../../shared/utils/queryBuilder";
import { IQueryParams } from "../../types/query.type";

const upsetMark = async (payload: IMarkCreate) => {
  if (!payload.marks.length) return [];
  const { examId, marks } = payload
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam) {
    throw new AppError(status.CONFLICT, "Exam not found");
  };

  const existing = await prisma.mark.findMany({
    where: {
      examId,
      studentId: {
        in: marks.map((m) => m.studentId),
      },
    },
  });

  if (existing.length > 0) {
    throw new AppError(
      status.CONFLICT,
      "Some students already have marks for this exam"
    );
  }
  return await prisma.$transaction(async (tx) => {
    const result = await Promise.all(
      marks.map(async (item) => {
        const { studentId, mark } = item

        if (mark > exam.totalMarks) {
          throw new AppError(
            status.CONFLICT,
            `Mark exceed for student ${studentId}`
          );
        }

        const grade = calculateGrade(mark, exam.totalMarks);

        const newMark = await tx.mark.upsert({
          where: {
            studentId_examId: {
              studentId,
              examId,
            },
          },
          update: {
            mark,
          },
          create: {
            studentId,
            examId,
            mark,
          },
        });

        const newResult = await tx.result.upsert({
          where: {
            studentId_examId: {
              studentId,
              examId,
            },
          },
          update: {
            mark,
            grade,
          },
          create: {
            studentId,
            examId,
            mark,
            grade,
          },
        });

        return { newMark, newResult };
      })
    )
    return result;
  })




};

const getAllMarks = async () => {
  return prisma.mark.findMany({
    include: {
      student: true,
      exam: true,
    },
  });
};

const getMarkById = async (id: string) => {
  return prisma.mark.findUnique({
    where: { id },
    include: {
      student: true,
      exam: true,
    },
  });
};

const deleteMark = async (id: string) => {
  const mark = await prisma.mark.findUnique({ where: { id } });
  if (!mark) throw new Error("Mark not found");

  return await prisma.$transaction(async (tx) => {
    await tx.result.deleteMany({
      where: { studentId: mark.studentId, examId: mark.examId },
    });
    return await tx.mark.delete({ where: { id } });
  });
};

export const getStudentResultsByRoll = async (rollNumber: string) => {

  const student = await prisma.student.findUnique({
    where: { rollNumber },
  });
  if (!student) throw new Error("Student not found");
  const results = await prisma.result.findMany({
    take:3,

    where: { studentId: student.id },
    select: {
      id: true,
      mark: true,
      grade: true,
      student: {
        select: {
          id: true,
          rollNumber: true,
          name: true
        }
      },
      exam: {
        select: {
          name: true,
          examDate: true,
          subject: {
            select: {
              name: true,
              id: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    student: {
      id: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
    },
    results,
  };
};

export const getAllStudentByExamId = async (examId: string, query: IQueryParams) => {
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const skip = (page - 1) * limit
  const builder = new QueryBuilder({}, query)
    .paginate()
    .search(["name", "rollNumber"])
  const exam = await prisma.exam.findUnique({
    where: {

      id: examId
    },
    include: {
      batch: {
        include: {
          batchStudents: {
            skip,
            take: limit,
            where: {

              isDeleted: false,
              student: {
                ...builder.query.where,
              }
            },
            include: {

              student: {

                select: {
                  id: true,
                  name: true,
                  rollNumber: true,
                  image: true
                },
              },
            },
          },
        },
      },
    },
  });
  const students = exam?.batch?.batchStudents.map((bs) => bs.student);
  const total = students?.length || 0

  return {
    data: students,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / page)
    }
  };
};

export const markService = {
  upsetMark,
  getAllMarks,
  getMarkById,
  deleteMark,
  getStudentResultsByRoll,
  getAllStudentByExamId
}