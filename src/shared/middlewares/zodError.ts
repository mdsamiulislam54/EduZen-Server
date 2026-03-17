import status from "http-status";
import z from "zod";

export interface IErrorSource {
    path: string,
    message: string
}

export const zodError = (err: z.ZodError) => {
    const statusCode = status.BAD_REQUEST;
    const errorMessage = "Zod Validation Error"
    const errorSource: IErrorSource[] = [];
    if (err instanceof z.ZodError) {
        err.issues.forEach(issue => {
            errorSource.push({
                path: issue.path.join(' => ').toString(),
                message: issue.message
            })
        })
    }
    return {
        success: false,
        message: errorMessage,
        err: err.message,
        errorSource,
        statusCode

    }
}