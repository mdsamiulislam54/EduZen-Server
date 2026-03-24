import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { examService } from "./exam.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";

const createExam = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body;
    const result = await examService.createExam(payload)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Exam create successfully",
        data: result
    })
});
const getAllExams = catchAsync(async (req: Request, res: Response) => {

    const query = req.query;
    const result = await examService.getAllExams(query)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Exam Retrieved successfully",
        data: result
    })
});
const getExamById = catchAsync(async (req: Request, res: Response) => {

    const id = req.params.id as string;
    const result = await examService.getExamById(id)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Exam Retrieved successfully",
        data: result
    })
});
const updateExam = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body;
    const examId = req.params.id as string;
    const result = await examService.updateExam(examId,payload)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Exam update successfully",
        data: result
    })
});
const deleteExam = catchAsync(async (req: Request, res: Response) => {

    const examId = req.params.id as string;
    const result = await examService.deleteExam(examId)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Exam Delete successfully",
        data: result
    })
});



export const examController = {
    createExam,
    updateExam,
    getAllExams,
    getExamById,
    deleteExam
}