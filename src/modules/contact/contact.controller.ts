import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";
import { adminService } from "../admin/admin.service";
import status from "http-status";
import { contactService } from "./contact.service";
import { IQueryParams } from "../../types/query.type";

const createContactMessage = catchAsync(async (req: Request, res: Response) => {
    const result = await contactService.createContactMessage(req.body);
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Contact message created successfully",
        data: result,
    });
}
);


const getAllContactMessages = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as IQueryParams
    const result = await contactService.getAllContactMessages(query);
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Get All Contact Messages Retrieved successfully",
        data: result,
    });
}
)

export const contactController = {
    createContactMessage,
    getAllContactMessages
}