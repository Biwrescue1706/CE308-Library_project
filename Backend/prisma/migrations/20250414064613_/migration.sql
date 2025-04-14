/*
  Warnings:

  - You are about to drop the column `expirationDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropIndex
DROP INDEX "Cart_userId_bookId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "expirationDate",
ADD COLUMN     "alley" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "houseNumber" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "subdistrict" TEXT,
ADD COLUMN     "villageNo" TEXT;

-- DropTable
DROP TABLE "Address";
