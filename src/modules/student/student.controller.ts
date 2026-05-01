import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { studentService } from "./student.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";
import { IQueryParams } from "../../types/query.type";

const createStudent = catchAsync(async(req: Request, res: Response) => {
 
    const payload = req.body;
    const userId = req.user.id as string;
    const result = await studentService.createStudent(payload,userId)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Student create successfully",
        data:result
    })
});
const studentUpdate = catchAsync(async(req: Request, res: Response) => {
    const payload = req.body;
    const id = req.params.id as string
    console.log(payload)

    const result = await studentService.updateStudent(payload,id)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Student Update successfully",
        data:result
    })
});
const getAllStudent = catchAsync(async(req: Request, res: Response) => {
    const id = req.user.id as string;
    const query = req.query as IQueryParams
    console.log(query)
    const result = await studentService.getAllStudent(id,query)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Student Retrieved successfully",
        data:result
    })
});
const getStudentById = catchAsync(async(req: Request, res: Response) => {
    const id = req.params.id as string
    const result = await studentService.getStudentById(id)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Student Retrieved successfully",
        data:result
    })
});
const studentDelete = catchAsync(async(req: Request, res: Response) => {
    const id = req.params.id as string
    const result = await studentService.studentDelete(id)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Student Delete successfully",
        data:result
    })
});


export const studentController = {
    createStudent,
    studentUpdate,
    getAllStudent,
    getStudentById,
    studentDelete
}