/*
  Warnings:

  - Made the column `stripeSubscriptionId` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SubscriptionPayment" DROP CONSTRAINT "SubscriptionPayment_coachingCenterId_fkey";

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "stripeSubscriptionId" SET NOT NULL;

-- AlterTable
ALTER TABLE "SubscriptionPayment" ALTER COLUMN "coachingCenterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_coachingCenterId_fkey" FOREIGN KEY ("coachingCenterId") REFERENCES "CoachingCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
