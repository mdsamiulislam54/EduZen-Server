import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodRawShape, ZodError } from "zod";

export const requestValidation = <T extends ZodRawShape>(schema: ZodObject<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
        
      if (req.body.data && typeof req.body.data === "string") {
        try {
          req.body = JSON.parse(req.body.data);
        } catch {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON in 'data' field",
            errorSources: [{ path: "data", message: "Invalid JSON" }],
          });
        }
      }
      const validatedData = schema.safeParse(req.body);

      if (!validatedData.success) {
        return next(validatedData.error);
      }

      req.body = validatedData.data;

      next();
    } catch (err) {
      next(err); 
    }
  };
};