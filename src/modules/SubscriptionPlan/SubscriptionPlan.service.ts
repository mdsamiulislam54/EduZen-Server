import status from "http-status";
import { stripe } from "../../config/stripe";
import { prisma } from "../../database/prisma";
import { AppError } from "../../shared/errors/app-error";
import { envVars } from "../../config/env";
import { ICheckoutPayload, TSubscriptionPlan } from "./subscriptionPlan.interface";
import { v7 as uuidv7 } from "uuid";


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
      email: true,
      name: true,

    }
  });
  if (!user) {
    throw new AppError(status.BAD_REQUEST, "User not found");
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
      subscriptionPlanId: plan.id,
      price: plan.price,
      userId: userId,
      email: user?.email,
      coachingCenterName: user.name
    }
  });

  await prisma.subscriptionPayment.create({
    data: {
      stripeSessionId: session.id,
      amount: plan.price || 0,
      subscriptionPlanId: plan.id,
      transactionId: String(uuidv7()),
      status: "PENDING",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }
  })


  return {
    checkoutUrl: session.url
  };
}


const checkOwnerSubscription = async (userId: string) => {
  const coachingCenter = await prisma.coachingCenter.findFirst({
    where: {
      ownerId: userId
    },
    select: {
      id: true
    }
  });
  const subscription = await prisma.subscription.findFirst({
    where: {
      coachingCenterId: coachingCenter?.id,
      status: "ACTIVE",
    },
  });


  return {
    hasSubscription: !!subscription,
    hasCoachingCenter: !!coachingCenter,
  }
};



export const subscriptionPlanService = {
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  subscriptionBuy,
  checkOwnerSubscription
}