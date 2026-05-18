import status from "http-status";
import { stripe } from "../../config/stripe";
import { prisma } from "../../database/prisma";
import { AppError } from "../../shared/errors/app-error";
import { envVars } from "../../config/env";
import { ICheckoutPayload, TSubscriptionPlan } from "./subscriptionPlan.interface";
import { uuidv7 } from "zod";


const createSubscriptionPlan = async (payload: TSubscriptionPlan) => {

  console.log({ payload })
  const plan = await prisma.subscriptionPlan.create({
    data: payload,
  });
  return plan;
};

const getAllSubscriptionPlans = async () => {
  return prisma.subscriptionPlan.findMany({
    where: { isDeleted: false },
    include: { subscriptions: true, payments: true },
  });
};

const getSubscriptionPlanById = async (id: string) => {
  return prisma.subscriptionPlan.findUnique({
    where: { id },
    include: { subscriptions: true, payments: true },
  });
};

const updateSubscriptionPlan = async (id: string, payload: any) => {
  return prisma.subscriptionPlan.update({
    where: { id },
    data: payload,
  });
};

const deleteSubscriptionPlan = async (id: string) => {

  return prisma.subscriptionPlan.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date(), status: "INACTIVE" },
  });
};

const subscriptionBuy = async (payload: ICheckoutPayload, userId: string) => {

  console.log(payload)
  const plan = await prisma.subscriptionPlan.findUnique({
    where: {
      id: payload.subscriptionId
    }
  });
  if (!plan) {
    throw new AppError(status.BAD_REQUEST, "Plan not found")
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      coachingCenter: {
        select: {
          id: true
        }
      }
    }
  });

  const coachingCenterId = user?.coachingCenter?.id;
  if (!coachingCenterId) {
    throw new AppError(status.BAD_REQUEST, "Coaching center not found");
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "bdt",
        product_data: {
          name: plan.name,
        },
        unit_amount: plan.price * 100,

      },

      quantity: 1

    }],

    success_url: `${envVars.FRONTEND_URL}/payment/success`,
    cancel_url: `${envVars.FRONTEND_URL}/payment/cancel`,
    metadata: {
      coachingCenterId,
      subscriptionPlanId: plan.id,
    }
  });



  return {
    checkoutUrl: session.url
  };
}






export const subscriptionPlanService = {
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  subscriptionBuy
}