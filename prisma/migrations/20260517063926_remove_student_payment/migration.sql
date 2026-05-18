/*
  Warnings:

  - You are about to drop the `StudentPayment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BKASH', 'NAGAD', 'BANK');

-- DropForeignKey
ALTER TABLE "StudentPayment" DROP CONSTRAINT "StudentPayment_studentFeeId_fkey";

-- DropForeignKey
ALTER TABLE "StudentPayment" DROP CONSTRAINT "StudentPayment_studentId_fkey";

-- AlterTable
ALTER TABLE "StudentFee" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH';

-- AlterTable
ALTER TABLE "SubscriptionPayment" ALTER COLUMN "transactionId" DROP NOT NULL;

-- DropTable
DROP TABLE "StudentPayment";
