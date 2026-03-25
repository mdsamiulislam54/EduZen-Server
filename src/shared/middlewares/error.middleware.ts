
import { NextFunction, Request, Response } from "express";
import z from "zod";
import { IErrorSource, zodError } from "./zodError";

import status from "http-status";
import { envVars } from "../../config/env";
import { Prisma } from "../../generated/client";


export const globalErrorHandler = async (err: any, req: Request, res: Response, _next: NextFunction) => {
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
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = status.BAD_REQUEST;
    message = "Validation Error from Prisma";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {

    switch (err.code) {


      case "P2002":
        statusCode = status.CONFLICT;
        message = `Duplicate field value: ${err.meta?.target}`;
        break;


      case "P2025":
        statusCode = status.NOT_FOUND;
        message = "Record not found";
        break;


      case "P2003":
        statusCode = status.BAD_REQUEST;
        message = "Invalid relation / foreign key failed";
        break;

      default:
        statusCode = status.BAD_REQUEST;
        message = "Prisma database error";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = "Unknown Prisma error";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = "Database connection error";
  } else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
  }


  res.status(statusCode).json({
    success: false,
    statusCode,
    errorSource,
    message: envVars.NODE_ENV === 'development' ? message : undefined,
    stack: envVars.NODE_ENV === 'development' ? stack : undefined,

  });

}