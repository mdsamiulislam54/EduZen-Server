import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { attendanceService } from "./attendance.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";

const createAttendance = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = {
        ...req.body,
        markBy: user.id,
    };

    const result = await attendanceService.createAttendance(payload)
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
const updateAttendance = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const payload = req.body;

    const result = await attendanceService.updateAttendance(id,payload)
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
    deleteAttendance
}