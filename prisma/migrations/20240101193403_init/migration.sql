/*
  Warnings:

  - The values [UNIT] on the enum `Unit_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Unit` MODIFY `type` ENUM('WORKER', 'PIONEER', 'WARRIOR', 'HEALER', 'MINER') NOT NULL;
