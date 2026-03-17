
import { NextFunction, Request, Response } from "express";
import z from "zod";
import { IErrorSource, zodError } from "./zodError";

import status from "http-status";
import { envVars } from "../../config/env";


export const globalErrorHandler = async (err: Error, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = err.message || "An unexpected error occurred";
  let errorSource: IErrorSource[] = [];
  let stack = err.stack;
  // console.log({ URL: req.file })
  //   if (req.file && req.file.path) {
  //     await deleteFileFromCloudinary(req.file.path); // <-- change to req.file.url or req.file.public_id
  // }

  // if (req.files && Array.isArray(req.files) && req.files.length > 0) {
  //     const imageUrls = req.files.map((file) => file.path);
  //     await Promise.all(imageUrls.map((url) => {
  //         deleteFileFromCloudinary(url)
  //     }))
  // }
  if (err instanceof z.ZodError) {
    const zodErrorResult = zodError(err);
    statusCode = zodErrorResult.statusCode;
    message = zodErrorResult.message;
    errorSource = zodErrorResult.errorSource;
  } else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR
    message = err.message
    stack = err.stack
  }
  res.status(statusCode).json({
    success: false,
    statusCode,
    errorSource,
    message: envVars.NODE_ENV === 'development' ? message : undefined,
    stack: envVars.NODE_ENV === 'development' ? stack : undefined,

  });

}