/*
  Warnings:

  - You are about to drop the column `examSubjectId` on the `Mark` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `Mark` table. All the data in the column will be lost.
  - You are about to drop the column `obtainedMarks` on the `Mark` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Mark` table. All the data in the column will be lost.
  - You are about to drop the column `examSubjectId` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `obtainedMarks` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the `ExamSubject` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,examId]` on the table `Mark` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,examId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subjectId` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examId` to the `Mark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mark` to the `Mark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mark` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_batchId_fkey";

-- DropForeignKey
ALTER TABLE "ExamSubject" DROP CONSTRAINT "ExamSubject_examId_fkey";

-- DropForeignKey
ALTER TABLE "ExamSubject" DROP CONSTRAINT "ExamSubject_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_examSubjectId_fkey";

-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_examSubjectId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_subjectId_fkey";

-- DropIndex
DROP INDEX "Mark_studentId_examSubjectId_key";

-- DropIndex
DROP INDEX "Result_studentId_examSubjectId_key";

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subjectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Mark" DROP COLUMN "examSubjectId",
DROP COLUMN "grade",
DROP COLUMN "obtainedMarks",
DROP COLUMN "position",
ADD COLUMN     "examId" TEXT NOT NULL,
ADD COLUMN     "mark" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "examSubjectId",
DROP COLUMN "obtainedMarks",
DROP COLUMN "position",
ADD COLUMN     "mark" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "subjectId" DROP NOT NULL;

-- DropTable
DROP TABLE "ExamSubject";

-- CreateIndex
CREATE UNIQUE INDEX "Mark_studentId_examId_key" ON "Mark"("studentId", "examId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_studentId_examId_key" ON "Result"("studentId", "examId");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
