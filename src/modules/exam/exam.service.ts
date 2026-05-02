import status from "http-status";
import { prisma } from "../../database/prisma";
import { Exam } from "../../generated/client";
import { AppError } from "../../shared/errors/app-error";
import { QueryBuilder } from "../../shared/utils/queryBuilder";
import { IQueryParams } from "../../types/query.type";

const createExam = async (payload: Exam) => {
  console.log({ payload })
  const { batchId, subjectId, name, examDate, startTime, endTime, } = payload;
  const startDateTime = new Date(`${examDate}T${startTime}`);
  const endDateTime = new Date(`${examDate}T${endTime}`);
  if (startDateTime >= endDateTime) {
    throw new AppError(400, "Start time must be before end time");
  }
  if (!payload.batchId) {
    throw new AppError(status.BAD_REQUEST, "BatchId is required");
  }
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
  });


  if (!batch) {
    throw new AppError(status.BAD_REQUEST, "Batch not found");
  }
  if (!payload.subjectId) {
    throw new AppError(status.BAD_REQUEST, "Subject is required");
  }
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    throw new AppError(status.BAD_REQUEST, "Subject not found");
  }

  const existingExam = await prisma.exam.findFirst({
    where: {
      batchId,
      subjectId,
      name,
    },
  });

  if (existingExam) {
    throw new AppError(status.BAD_REQUEST, "Exam already exists for this subject in this batch");
  }

  const exam = await prisma.exam.create({
    data: {
      ...payload,
      examDate: new Date(examDate),
      startTime: startDateTime,
      endTime: endDateTime

    },
  });

  return exam;
};

const updateExam = async (id: string, payload: any) => {
  const existingExam = await prisma.exam.findUnique({
    where: { id },
  });

  if (!existingExam) {
    throw new Error("Exam not found");
  }


  if (payload.startTime && payload.endTime) {
    if (new Date(payload.startTime) >= new Date(payload.endTime)) {
      throw new Error("Start time must be before end time");
    }
  }

  if (payload.name) {
    const duplicate = await prisma.exam.findFirst({
      where: {
        id: { not: id },
        batchId: existingExam.batchId,
        subjectId: existingExam.subjectId,
        name: payload.name,
      },
    });

    if (duplicate) {
      throw new Error("Exam name already exists");
    }
  }

  const updatedExam = await prisma.exam.update({
    where: { id },
    data: {
      ...payload,
      examDate: payload.examDate ? new Date(payload.examDate) : undefined,
      startTime: payload.startTime ? new Date(payload.startTime) : undefined,
      endTime: payload.endTime ? new Date(payload.endTime) : undefined,
    },
  });

  return updatedExam;
};

const getAllExams = async (query: IQueryParams) => {
  console.log({ query })
  const builder = new QueryBuilder({}, query)
    .search(["name"])
    .paginate()
  const exams = await prisma.exam.findMany({
    where: {
      ...builder.query.where,
      isDeleted: false
    },
    orderBy: { createdAt: "desc" },

  });

  const meta = await builder.getMeta(prisma.exam);



  return {
    data: exams,
    meta
  }
};

const getExamById = async (id: string) => {
  const exam = await prisma.exam.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      batch: true,
      subject: true,
      results: true,
    },
  });

  if (!exam) {
    throw new Error("Exam not found");
  }

  return exam;
};

const deleteExam = async (id: string) => {
  const exam = await prisma.exam.findUnique({
    where: { id },
  });

  if (!exam) {
    throw new Error("Exam not found");
  }

  const deleted = await prisma.exam.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  return deleted;
};

export const examService = {
  createExam,
  updateExam,
  getAllExams,
  getExamById,
  deleteExam
}