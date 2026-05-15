import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";
import { stripe } from "../../config/stripe";
import { envVars } from "../../config/env";
import Stripe from "stripe";

const handlePaymentWebHook = catchAsync(async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = envVars.STRIPE_WEBHOOK_SECRET

    if (!sig || !webhookSecret) {
        console.error("Missing stripe Signature or webhook secret")
        return res.status(status.BAD_REQUEST).json({
            message: "Missing stripe Signature or webhook secret"
        })
    }
    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig!,
            webhookSecret

        )

    } catch (error) {
        console.error("Error Stripe Webhook")

        return sendResponse(res, {
            status: status.OK,
            success: false,
            message: "Payment Received Failed",
            data: error
        })
    }

    try {
        const result = await paymentService.handlePaymentWebHook(event);
        sendResponse(res, {
            status: status.OK,
            success: true,
            message: "Payment Received Successful",
            data: result
        })
    } catch (error) {
        console.error("Error Stripe Webhook")

       return sendResponse(res, {
            status: status.OK,
            success: false,
            message: "Payment Received Failed",
            data: error
        })
    }


});

export const paymentController = {
    handlePaymentWebHook
}