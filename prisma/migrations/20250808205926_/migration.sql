/*
  Warnings:

  - You are about to drop the `Production` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Shipment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShipmentProduction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DEPOSIT', 'SELLER');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('STORED', 'DISCARDED', 'SENT', 'EDITED', 'RECEIVED_MARKET', 'AVAILABLE', 'ORDERED', 'SOLD', 'CANCELED', 'DELIVERED', 'NOT_DELIVERED', 'RETURNED');

-- DropForeignKey
ALTER TABLE "Production" DROP CONSTRAINT "Production_productId_fkey";

-- DropForeignKey
ALTER TABLE "Production" DROP CONSTRAINT "Production_userId_fkey";

-- DropForeignKey
ALTER TABLE "Shipment" DROP CONSTRAINT "Shipment_userId_fkey";

-- DropForeignKey
ALTER TABLE "ShipmentProduction" DROP CONSTRAINT "ShipmentProduction_productionId_fkey";

-- DropForeignKey
ALTER TABLE "ShipmentProduction" DROP CONSTRAINT "ShipmentProduction_shipmentId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- DropTable
DROP TABLE "Production";

-- DropTable
DROP TABLE "Shipment";

-- DropTable
DROP TABLE "ShipmentProduction";

-- CreateTable
CREATE TABLE "Batch" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "initialQuantity" INTEGER NOT NULL,
    "depositQuantity" INTEGER NOT NULL,
    "marketQuantity" INTEGER NOT NULL DEFAULT 0,
    "sentQuantity" INTEGER NOT NULL DEFAULT 0,
    "receivedQuantity" INTEGER NOT NULL DEFAULT 0,
    "discardedQuantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "soltQuantity" INTEGER NOT NULL DEFAULT 0,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "MovementType" NOT NULL,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovementDetail" (
    "id" SERIAL NOT NULL,
    "movementId" INTEGER NOT NULL,
    "batchId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "MovementDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Batch_code_key" ON "Batch"("code");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementDetail" ADD CONSTRAINT "MovementDetail_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "Movement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementDetail" ADD CONSTRAINT "MovementDetail_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
