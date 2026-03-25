import { prisma } from "../../database/prisma";


 const createSubscriptionPlan = async (payload: any) => {
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

export const subscriptionPlanService= {
    createSubscriptionPlan,
    getAllSubscriptionPlans,
    getSubscriptionPlanById,
    updateSubscriptionPlan,
    deleteSubscriptionPlan
}