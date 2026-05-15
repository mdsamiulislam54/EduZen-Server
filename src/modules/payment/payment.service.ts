import Stripe from "stripe"
import { prisma } from "../../database/prisma";
import { AppError } from "../../shared/errors/app-error";
import status from "http-status";

const handlePaymentWebHook = async (event: Stripe.Event) => {
    if (event.type !== "checkout.session.completed") return;

    const session = event.data.object as Stripe.Checkout.Session;

    const metaData = session.metadata;

    console.log({ session, metaData })

    if (metaData?.type === "subscription") {

        await prisma.$transaction(async (tx) => {
            const payment = await tx.subscriptionPayment.findUnique({
                where: {
                    stripeSessionId: session.id
                }
            });

            if (!payment) {
                throw new AppError(status.BAD_REQUEST, "Subscription payment not found")
            };

        
            if (payment) {
                await tx.subscription.updateMany({
                    where: {
                        coachingCenterId: metaData.coachingCenterId,
                    },
                    data: {
                        status: "ACTIVE"
                    }
                });
            } else {
                await tx.subscription.create({
                    data: {
                        coachingCenterId:
                            metaData.coachingCenterId,

                        subscriptionPlanId:
                            metaData.subscriptionPlanId,
                        stripeCustomerId: session.customer as string,
                        startDate: new Date(),

                        endDate: new Date(
                            Date.now() +
                            30 * 24 * 60 * 60 * 1000
                        ),

                        status: "ACTIVE"
                    }
                });
            }

            await tx.subscriptionPayment.update({
                where: {
                    stripeSessionId: session.id
                },

                data: {
                    status: "PAID",
                    transactionId: session.id,
                    paymentDetails: JSON.parse(JSON.stringify(session))
                }
            });

        })



    }

    if (metaData?.type === "student") {
        await prisma.$transaction(async (tx) => {
            const payment = await tx.studentPayment.findUnique({
                where: {
                    stripeSessionId: session.id,
                }
            });

            if (!payment) {
                throw new AppError(status.BAD_REQUEST, "Student payment not found")
            };

            await tx.studentPayment.update({
                where: {
                    stripeSessionId: session.id,
                },
                data: {
                    status: "PAID",
                    stripePaymentId: session.id as string,
                    transactionId: session.id as string,
                    paymentDetails: JSON.parse(JSON.stringify(session))

                }
            })

            await tx.studentFee.update({
                where: {
                    id: payment.studentFeeId
                },
                data: {
                    paidAmount: {
                        increment: payment.amount
                    },

                    dueAmount: {
                        decrement: payment.amount,
                    },
                }
            })

        })
    }
}

export const paymentService = { handlePaymentWebHook }