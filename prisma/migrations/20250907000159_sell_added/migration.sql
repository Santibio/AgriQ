-- CreateEnum
CREATE TYPE "public"."StatusDoing" AS ENUM ('PENDING', 'READY_TO_DELIVER', 'DELIVERED');

-- CreateEnum
CREATE TYPE "public"."StatusPayment" AS ENUM ('PAID', 'UNPAID', 'PARCIAL_PAID', 'CANCELED');

-- AlterTable
ALTER TABLE "public"."Batch" ADD COLUMN     "discrepancyQuantity" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" SERIAL NOT NULL,
    "movementId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "statusDoing" "public"."StatusDoing" NOT NULL DEFAULT 'PENDING',
    "statusPayment" "public"."StatusPayment" NOT NULL DEFAULT 'UNPAID',
    "total" DOUBLE PRECISION NOT NULL,
    "agreedDeliveryTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderDetail" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sell" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "movementId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_movementId_key" ON "public"."Order"("movementId");

-- CreateIndex
CREATE UNIQUE INDEX "Sell_orderId_key" ON "public"."Sell"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Sell_movementId_key" ON "public"."Sell"("movementId");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "public"."Movement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderDetail" ADD CONSTRAINT "OrderDetail_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
