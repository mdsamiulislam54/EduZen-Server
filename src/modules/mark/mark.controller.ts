import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { markService } from "./mark.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";

const upsertMark = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await markService.upsetMark(payload);

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Mark saved successfully",
        data: result,
    });
});
const getAllMarks = catchAsync(async (req: Request, res: Response) => {
    const result = await markService.getAllMarks();
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Mark Retrieved successfully",
        data: result,
    });
});
const getMarkById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await markService.getMarkById(id);
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Mark Retrieved successfully",
        data: result,
    });
});
const getStudentResultsByRoll = catchAsync(async (req: Request, res: Response) => {
    const rollNumber = req.params.roll as string;
    const result = await markService.getStudentResultsByRoll(rollNumber);
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Mark Retrieved successfully",
        data: result,
    });
});
const deleteMark = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await markService.deleteMark(id);
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Mark Retrieved successfully",
        data: result,
    });
});


export const markController = {
    upsertMark,
    getAllMarks,
    getMarkById,
    getStudentResultsByRoll,
    deleteMark
}