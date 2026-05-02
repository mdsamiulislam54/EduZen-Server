import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { attendanceService } from "./attendance.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";
import { QueryBuilder } from "../../shared/utils/queryBuilder";
import { IQueryParams } from "../../types/query.type";

const createAttendance = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const userId = req.user.id as string

    const result = await attendanceService.createAttendance(req.body, userId)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Attendance create successfully",
        data: result
    })
});
const getAllAttendance = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await attendanceService.getAllAttendance(query)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Attendance Retrieved successfully",
        data: result
    })
});
const getStudentById = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as IQueryParams
    const batchId = req.params.id as string;

    console.log({
        query, batchId
    })

    const result = await attendanceService.getStudentById(batchId, query)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Student Retrieved successfully",
        data: result
    })
});
const getAttendanceByStudentId = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.params.id as string;
    const query = req.query as IQueryParams
    const result = await attendanceService.getAttendanceByStudentId(studentId, query)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Student Attendance Retrieved successfully",
        data: result
    })
});
const updateAttendance = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const payload = req.body;

    const result = await attendanceService.updateAttendance(id, payload)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Attendance Update successfully",
        data: result
    })
});
const deleteAttendance = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await attendanceService.deleteAttendance(id)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Attendance Delete successfully",
        data: result
    })
});


export const attendanceController = {
    createAttendance,
    getAllAttendance,
    updateAttendance,
    deleteAttendance,
    getStudentById,
    getAttendanceByStudentId
}