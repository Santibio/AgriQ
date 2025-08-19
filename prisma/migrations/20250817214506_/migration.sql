-- CreateEnum
CREATE TYPE "FiscalCondition" AS ENUM (
    'RESPONSIBLE',
    'MONOTAX',
    'FINAL_CONSUMER',
    'EXEMPT'
);

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM (
    'PENDING',
    'PENDING',
    'DELIVERED',
    'NOT_DELIVERED'
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "lastName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" VARCHAR(13) NOT NULL,
    "email" TEXT NOT NULL,
    "fiscalCondition" "FiscalCondition" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" SERIAL NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "movementId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_movementId_key" ON "Shipment"("movementId");

-- AddForeignKey
ALTER TABLE
    "Shipment"
ADD
    CONSTRAINT "Shipment_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "Movement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;