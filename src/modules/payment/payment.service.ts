import Stripe from "stripe"
import { prisma } from "../../database/prisma";
import { AppError } from "../../shared/errors/app-error";
import status from "http-status";
import { v7 as uuidv7 } from "uuid";

const handlePaymentWebHook = async (event: Stripe.Event) => {
    switch (event.type) {
        case "checkout.session.completed":
            {
                const session = event.data.object;
        
                const metaData = session?.metadata;
                if (!metaData?.subscriptionPlanId || !metaData?.userId || !metaData.price) {
                   
                    throw new AppError(status.BAD_REQUEST, "Metadata missing");
                }

                const planId = metaData.subscriptionPlanId;
                const userId = metaData.userId;

                try {
                
                        const payment = await prisma.subscriptionPayment.findUnique({
                            where: {
                                stripeSessionId: session.id,
                            },
                        });

                      

                        if (!payment) {
                            console.log("❌ Payment NOT FOUND in DB");
                            throw new AppError(status.BAD_REQUEST, "Payment not found");
                        }

                        


                        console.log("✔ Payment UPDATED");

                        const user = await prisma.user.findUnique({
                            where: { id: userId },
                        });

                        console.log("👤 User:", user);

                        if (!user) {
                            console.log("❌ User NOT FOUND");
                            throw new AppError(status.BAD_REQUEST, "User not found");
                        }

                        let existingCenter = await prisma.coachingCenter.findUnique({
                            where: { ownerId: userId },
                        });

                      

                        if (!existingCenter) {
                            console.log("🏗 Creating coaching center...");

                            existingCenter = await prisma.coachingCenter.create({
                                data: {
                                    name: metaData.coachingCenterName || `${user.name} Coaching Center`,
                                    email: metaData.email || "",
                                    ownerId: userId,
                                    address: "",
                                },
                            });

                          
                        }

                        const subscription = await prisma.subscription.upsert({
                            where: {
                                coachingCenterId: existingCenter.id,
                            },
                            update: {
                                status: "ACTIVE",
                                subscriptionPlanId: planId,
                                startDate: new Date(),
                                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            },
                            create: {
                                coachingCenterId: existingCenter.id,
                                subscriptionPlanId: planId,
                                stripeSubscriptionId: session.id,
                                status: "ACTIVE",
                                startDate: new Date(),
                                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            },
                        });

                       

                        await prisma.coachingCenter.update({
                            where: { id: existingCenter.id },
                            data: {
                                plan: subscription.id,
                            },
                        });
                        await prisma.subscriptionPayment.update({
                            where: {
                                stripeSessionId: session.id,
                            },
                            data: {
                                status: "PAID",
                                coachingCenterId: existingCenter.id,
                                paymentDetails: session as any,
                            },
                        });
                      


                    
                } catch (error) {
                    console.log("🔥 WEBHOOK FAILED:");
                    console.log(error);
                }
            }
            break;
        case "payment_intent.succeeded":
            console.log("Event received:", event.type);
            break;
        case "payment_intent.payment_failed":
            console.log("Event received:", event.type);
            break;
        case "charge.succeeded":
            console.log("Event received:", event.type);
            break;
        case "charge.updated":
            console.log("Event received:", event.type);
            break;
        case "payment_intent.created":
            console.log("Event received:", event.type);
            break;
        case "checkout.session.expired":
            console.log("Event received:", event.type);
            break;
        case "balance.available":
            console.log(" Event received:", event.type);
            break;

        default:
            console.log("⏭ Unhandled event:", event.type);

    }
};
export const paymentService = { handlePaymentWebHook }