/*
  Warnings:

  - The primary key for the `Tile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `faction` on the `Tile` table. All the data in the column will be lost.
  - Added the required column `factionId` to the `Tile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Tile` DROP PRIMARY KEY,
    DROP COLUMN `faction`,
    ADD COLUMN `factionId` INTEGER NOT NULL,
    MODIFY `id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`, `gameId`);

-- CreateTable
CREATE TABLE `Unit` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('WORKER', 'UNIT', 'WARRIOR', 'HEALER', 'MINER') NOT NULL,
    `health` INTEGER NOT NULL,
    `index` INTEGER NOT NULL,
    `factionId` INTEGER NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faction` (
    `id` INTEGER NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `gameName` VARCHAR(191) NOT NULL,
    `gold` INTEGER NOT NULL,
    `baseIndex` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `land` INTEGER NOT NULL,
    `destroyed` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`, `gameId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_factionId_gameId_fkey` FOREIGN KEY (`factionId`, `gameId`) REFERENCES `Faction`(`id`, `gameId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Faction` ADD CONSTRAINT `Faction_gameName_gameId_fkey` FOREIGN KEY (`gameName`, `gameId`) REFERENCES `Game`(`name`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;
