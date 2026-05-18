import Stripe from "stripe"
import { prisma } from "../../database/prisma";
import { AppError } from "../../shared/errors/app-error";
import status from "http-status";
import { v7 as uuidv7 } from "uuid";

const handlePaymentWebHook = async (event: Stripe.Event) => {
    if (event.type !== "checkout.session.completed") return;

    const session = event.data.object as Stripe.Checkout.Session;

    const metaData = session?.metadata;

    if (!metaData?.coachingCenterId || !metaData?.subscriptionPlanId) {
        throw new AppError(status.BAD_REQUEST, "Metadata missing");
    }
    const coachingCenterId = metaData?.coachingCenterId;
    const planId = metaData?.subscriptionPlanId;
    console.log({ session, metaData })


    await prisma.$transaction(async (tx) => {
        const payment = await tx.subscriptionPayment.findUnique({
            where: {
                stripeSessionId: session.id,
            },
        });

        if (!payment) {
            throw new AppError(status.BAD_REQUEST, "Payment not found");
        }

        await tx.subscription.upsert({
            where: {
                coachingCenterId,
            },
            update: {
                status: "ACTIVE",
                subscriptionPlanId: planId,
            },
            create: {
                coachingCenterId,
                subscriptionPlanId: planId,
                status: "ACTIVE",
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        await tx.subscriptionPayment.update({
            where: {
                stripeSessionId: session.id,
            },
            data: {
                status: "PAID",
                transactionId: uuidv7(),
                paymentDetails: session as any,
            },
        });




    })






}

export const paymentService = { handlePaymentWebHook }