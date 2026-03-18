import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { studentService } from "./student.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";

const createStudent = catchAsync(async(req: Request, res: Response) => {
 
    const payload = req.body;
    const result = await studentService.createStudent(payload)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Student create successfully",
        data:result
    })
});


export const studentController = {
    createStudent
}