import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";
import { coachingCenterService } from "./coaching-center.service";

const createCoachingCenter = catchAsync(async(req: Request, res: Response) => {
    const payload = req.body;
    console.log(payload)
   
    const result = await coachingCenterService.createCoachingCenter(payload)
    sendResponse(res, {
        status: status.CREATED,
        success: true,
        message: "Coaching Center registered successfully",
        data:result
    })
});



export const coachingCenterController = {
    createCoachingCenter
}