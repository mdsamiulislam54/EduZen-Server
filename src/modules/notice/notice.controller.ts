// notice.controller.ts

import status from "http-status";
import { Request, Response } from "express";

import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";

import { NoticeService } from "./notice.service";
import { IQueryParams } from "../../types/query.type";


const createNotice = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const payload = req.body;

    const result = await NoticeService.createNotice(
        payload,
        userId
    );

    sendResponse(res, {
        status: status.CREATED,
        success: true,
        message: "Notice created successfully",
        data: result,
    });
}
);


const getAllNotice = catchAsync(async (req: Request, res: Response) => {

    const userId = req.user.id;
    console.log(req.user)
    const query = req.query;

    const result = await NoticeService.getAllNotice(
        userId,
        query as IQueryParams
    );

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Notices retrieved successfully",
       data: result,
    });
}
);



const getNoticeById = catchAsync(async (req: Request, res: Response) => {

    const userId = req.user.id;
    const id = req.params.id as string;

    const result = await NoticeService.getNoticeById(
        id,
        userId
    );

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Notice retrieved successfully",
        data: result,
    });
}
);



const updateNotice = catchAsync(async (req: Request, res: Response) => {

    const userId = req.user.id;
    const { id } = req.params;
    const payload = req.body;

    const result = await NoticeService.updateNotice(
        id as string,
        payload,
        userId
    );

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Notice updated successfully",
        data: result,
    });
}
);


const deleteNotice = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result =
        await NoticeService.deleteNotice(
            id as string,
            userId
        );

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Notice deleted successfully",
        data: result,
    });
}
);


export const noticeController = {
    createNotice,
    getAllNotice,
    getNoticeById,
    updateNotice,
    deleteNotice,
};