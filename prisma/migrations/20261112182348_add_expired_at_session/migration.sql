/*
  Warnings:

  - Added the required column `expiredAT` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "session" ADD COLUMN     "expiredAT" TIMESTAMP(3) NOT NULL;
