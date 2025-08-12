-- CreateEnum
CREATE TYPE "FiscalCondition" AS ENUM ('RESPONSIBLE', 'MONOTAX', 'FINAL_CONSUMER', 'EXEMPT');

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

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
