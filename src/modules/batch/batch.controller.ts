import status from "http-status";
import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";
import { Request, Response } from "express";
import { batchService } from "./batch.service";

const createBatch = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body;
    const result = await batchService.createBatch(payload)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Student create successfully",
        data: result
    })
});

export const batchController = {
    createBatch
}