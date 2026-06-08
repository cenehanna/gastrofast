/*
  Warnings:

  - You are about to drop the column `clientName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `clientPhone` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[trackingToken]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - The required column `trackingToken` was added to the `Order` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "clientName",
DROP COLUMN "clientPhone",
ADD COLUMN     "guestEmail" TEXT,
ADD COLUMN     "guestName" TEXT,
ADD COLUMN     "guestPhone" TEXT,
ADD COLUMN     "trackingToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_trackingToken_key" ON "Order"("trackingToken");
