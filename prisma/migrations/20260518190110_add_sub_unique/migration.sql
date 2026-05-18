/*
  Warnings:

  - A unique constraint covering the columns `[coachingCenterId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subscription_coachingCenterId_key" ON "Subscription"("coachingCenterId");
