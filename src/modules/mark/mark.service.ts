import status from "http-status";
import { prisma } from "../../database/prisma";
import { Mark } from "../../generated/client";
import { AppError } from "../../shared/errors/app-error";
import { calculateGrade } from "./utils";

const upsetMark = async (payload: Mark) => {
    const { studentId, examId, mark } = payload;
    const exam = await prisma.exam.findUnique({
        where: { id: examId },
    });
    if (!exam) {
        throw new AppError(status.CONFLICT, "Exam not found");
    };

    if (mark > exam.totalMarks) {
        throw new AppError(status.CONFLICT, "Mark exceed total marks");
    };
    const student = await prisma.student.findUnique({
        where: { id: studentId },
    });

    if (!student) {
        throw new Error("Student not found");
    }

    const grade = calculateGrade(mark, exam.totalMarks);
    return await prisma.$transaction(async (tx) => {
        const newMark = await tx.mark.upsert({
            where: {
                studentId_examId: { studentId, examId },

            },
            update: {
                mark
            },
            create: {
                studentId,
                examId,
                mark,

            }
        })
        const newResult = await tx.result.upsert({
            where: {
                studentId_examId: { studentId, examId },

            },
            update: {
                mark,
                grade
            },
            create: {
                studentId,
                examId,
                mark,
                grade

            }
        });

        return { newMark, newResult }
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
    where: { studentId: student.id },
    include: {
      exam: {
        include: {
          batch: true,
        },
      },
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

export const markService = {
    upsetMark,
    getAllMarks,
    getMarkById,
    deleteMark,
    getStudentResultsByRoll
}