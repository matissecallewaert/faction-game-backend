/*
  Warnings:

  - The values [HEALER] on the enum `Unit_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Faction` MODIFY `currentUpkeep` INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE `Unit` MODIFY `type` ENUM('WORKER', 'PIONEER', 'WARRIOR', 'MINER') NOT NULL;
