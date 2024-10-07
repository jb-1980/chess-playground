/*
  Warnings:

  - A unique constraint covering the columns `[gameId]` on the table `GameOutcomes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GameOutcomes_gameId_key" ON "GameOutcomes"("gameId");
