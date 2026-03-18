import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";
import { coachingCenterService } from "./coaching-center.service";

const createCoachingCenter = catchAsync(async(req: Request, res: Response) => {
    const payload = req.body;
    const result = await coachingCenterService.createCoachingCenter(payload)
    sendResponse(res, {
        status: status.CREATED,
        success: true,
        message: "Coaching Center registered successfully",
        data:result
    })
});
const updateCoachingCenterById = catchAsync(async(req: Request, res: Response) => {
    const payload = req.body;
    const coachingId = req.params.id as string;
    const result = await coachingCenterService.updateCoachingCenterById(payload,coachingId)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Coaching Center Update successfully",
        data:result
    })
});
const getCoachingCenter = catchAsync(async(req: Request, res: Response) => {
 
    const result = await coachingCenterService.getCoachingCenter()
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Coaching Center Retrieve successfully",
        data:result
    })
});
const coachingCenterDeleteById = catchAsync(async(req: Request, res: Response) => {
 
    const id = req.params.id as string;
    const result = await coachingCenterService.coachingCenterDeleteById(id)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Coaching Center Delete successfully",
        data:result
    })
});





export const coachingCenterController = {
    createCoachingCenter,
    updateCoachingCenterById,
    getCoachingCenter,
    coachingCenterDeleteById
}