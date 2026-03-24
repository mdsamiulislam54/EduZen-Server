import { prisma } from "../../database/prisma";

const createExam = async (payload: any) => {
  const {batchId,subjectId,name,totalMarks,passMarks,examDate,startTime,endTime,Status} = payload;

  if (new Date(startTime) >= new Date(endTime)) {
    throw new Error("Start time must be before end time");
  }
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
  });

  if (!batch) {
    throw new Error("Batch not found");
  }

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    throw new Error("Subject not found");
  }

  const existingExam = await prisma.exam.findFirst({
    where: {
      batchId,
      subjectId,
      name,
    },
  });

  if (existingExam) {
    throw new Error("Exam already exists for this subject in this batch");
  }

  const exam = await prisma.exam.create({
    data: {
      batchId,
      subjectId,
      name,
      totalMarks,
      passMarks,
      examDate: new Date(examDate),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
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

const getAllExams = async (query: any) => {
  const { page = 1, limit = 10, search, batchId, subjectId } = query;
  const where: any = {
    isDeleted: false,
    ...(batchId && { batchId }),
    ...(subjectId && { subjectId }),
    ...(search && {
      name: {
        contains: search,
        mode: "insensitive",
      },
    }),
  };

  const exams = await prisma.exam.findMany({
    where,
    take: Number(limit),
    orderBy: { createdAt: "desc" },
    include: {
      batch: true,
      subject: true,
    },
  });


  return exams
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