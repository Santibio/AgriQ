-- CreateEnum
CREATE TYPE "DiscardReason" AS ENUM ('DAMAGED', 'EXPIRED', 'OTHER');

-- CreateTable
CREATE TABLE "Discard" (
    "id" SERIAL NOT NULL,
    "reason" "DiscardReason" NOT NULL,
    "movementId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Discard_movementId_key" ON "Discard"("movementId");

-- AddForeignKey
ALTER TABLE "Discard" ADD CONSTRAINT "Discard_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "Movement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
