import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { adminService } from "./admin.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";

const getAllOwners = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getAllOwners();
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Get All Owner Retrieved successfully",
        data: result,
    });
}
)
const getOwnerById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await adminService.getOwnerById(id);
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Owner Retrieved successfully",
        data: result,
    });
}
)
const deleteOwner = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await adminService.deleteOwner(id);
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Owner delete successfully",
        data: result,
    });
}
)
const adminDashboardData = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.adminDashboardData();
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "AdminDashboardData Retrieved successfully",
        data: result,
    })
})

const adminAnalytics = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.adminAnalytics();
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "AdminAnalytics Retrieved successfully",
        data: result,
    });
}
)


export const adminController = {
    getAllOwners,
    getOwnerById,
    deleteOwner,
    adminAnalytics,
    adminDashboardData
}