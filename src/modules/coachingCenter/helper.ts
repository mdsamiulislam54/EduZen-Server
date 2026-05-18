import { prisma } from "../../database/prisma";

const getActiveSubscription = async (coachingCenterId: string) => {
  return await prisma.subscription.findFirst({
    where: {
      coachingCenterId,
      status: "ACTIVE",
      endDate: {
        gt: new Date(),
      },
    },
    include: {
      subscriptionPlan: true,
    },
  });
};