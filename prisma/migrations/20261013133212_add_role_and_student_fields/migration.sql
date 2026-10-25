/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ENSEIGNANT', 'ETUDIANT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "filiere" TEXT,
ADD COLUMN     "moyenne" DOUBLE PRECISION,
ADD COLUMN     "niveau" TEXT,
ALTER COLUMN "name" SET NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ETUDIANT';
