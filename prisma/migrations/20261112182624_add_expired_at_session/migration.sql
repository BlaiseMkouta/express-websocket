/*
  Warnings:

  - You are about to drop the column `expiredAT` on the `session` table. All the data in the column will be lost.
  - Added the required column `expiredAt` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "session" DROP COLUMN "expiredAT",
ADD COLUMN     "expiredAt" TIMESTAMP(3) NOT NULL;
