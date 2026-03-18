import status from "http-status";
import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";
import { Request, Response } from "express";
import { batchService } from "./batch.service";

const createBatch = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body;
    const ownerId = req.user.id as string;
    const result = await batchService.createBatch(payload, ownerId)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Batch create successfully",
        data: result
    })
});
const getAllBatch = catchAsync(async (req: Request, res: Response) => {

    const result = await batchService.getAllBatch()
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Batch Retrieved successfully",
        data: result
    })
});
const getBatchById = catchAsync(async (req: Request, res: Response) => {
    const batchId = req.params.id as string
    const result = await batchService.getBatchById(batchId)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Batch Retrieved By Id successfully",
        data: result
    })
});
const batchUpdateById = catchAsync(async (req: Request, res: Response) => {
    const batchId = req.params.id as string
    const payload = req.body;
    const result = await batchService.batchUpdateById(payload,batchId)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Batch Update successfully",
        data: result
    })
});

const batchDeleteById = catchAsync(async (req: Request, res: Response) => {
    const batchId = req.params.id as string
    const result = await batchService.batchDeleteById(batchId)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Batch Delete successfully",
        data: result
    })
});

export const batchController = {
    createBatch,
    getAllBatch,
    getBatchById,
    batchUpdateById,
    batchDeleteById
}